import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// CORS headers - restrict to allowed origins in production
const getAllowedOrigin = (): string => {
  const origin = Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowedOrigins = origin.split(',').map(o => o.trim()).filter(Boolean);
  
  if (allowedOrigins.length > 0) {
    return allowedOrigins[0];
  }
  
  return Deno.env.get('ENVIRONMENT') === 'production' ? '' : '*';
};

const corsHeaders = (origin?: string | null): Record<string, string> => {
  const allowedOrigin = getAllowedOrigin();
  const requestOrigin = origin || '*';
  
  const corsOrigin = allowedOrigin === '*' || Deno.env.get('ENVIRONMENT') !== 'production'
    ? '*'
    : (allowedOrigin.includes(requestOrigin) ? requestOrigin : '');
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || typeof authHeader !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authorization header must use Bearer token format' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    const returnUrl = Deno.env.get('STRIPE_PORTAL_RETURN_URL') ?? Deno.env.get('SUPABASE_URL') ?? '';

    // Validate environment variables
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: 'Stripe secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Validate user session using anon key (auth context from header)
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
    }

    // Fetch Stripe customer id from subscriptions or users table (service role for RLS bypass if needed)
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Try subscriptions table first
    const { data: sub, error: subErr } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let stripeCustomerId = sub?.stripe_customer_id as string | undefined;

    if (!stripeCustomerId) {
      // Fallback to users table if we store it there
      const { data: userRow } = await admin
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .maybeSingle();
      stripeCustomerId = (userRow as any)?.stripe_customer_id;
    }

    if (!stripeCustomerId) {
      return new Response(JSON.stringify({ error: 'No Stripe customer found for user' }), { status: 400, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Customer portal error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  }
});


