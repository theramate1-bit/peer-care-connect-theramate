import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@15.0.0';

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

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: 'Server not configured: STRIPE_SECRET_KEY missing' }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Validate Content-Type for POST requests
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
        });
      }
    }

    // Parse and validate request body
    let body: any = {};
    if (req.method === 'POST') {
      try {
        const bodyText = await req.text();
        
        // Limit body size to prevent DoS (10MB limit)
        if (bodyText.length > 10 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'Request body is too large (max 10MB)' }), {
            status: 400,
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
          });
        }
        
        if (bodyText && bodyText.trim().length > 0) {
          body = JSON.parse(bodyText);
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
        });
      }
    }

    // Get checkout session ID from body or query params
    const checkoutSessionId = body.checkout_session_id || new URL(req.url).searchParams.get('session_id');
    
    // Validate checkout session ID
    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid checkout_session_id' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }
    
    // Validate Stripe checkout session ID format (starts with cs_)
    if (!checkoutSessionId.startsWith('cs_') || checkoutSessionId.length < 10 || checkoutSessionId.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid checkout session ID format' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Verify user
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
    }

    // Retrieve Checkout Session and related subscription/customer
    const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId, { expand: ['subscription', 'customer', 'payment_intent'] });
    if (!cs || cs.status !== 'complete') {
      return new Response(JSON.stringify({ success: false, message: 'Checkout not completed' }), { status: 200, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
    }

    // Determine plan and billing from subscription if present
    let plan = 'practitioner';
    let billing_cycle: 'monthly' | 'yearly' = 'monthly';
    let status = 'active';
    let stripe_subscription_id: string | null = null;
    let priceId: string | undefined;
    if (cs.subscription && typeof cs.subscription === 'object') {
      const sub: any = cs.subscription;
      stripe_subscription_id = sub.id;
      priceId = sub.items?.data?.[0]?.price?.id;
      if (priceId) {
        if (priceId.includes('SGfPIFk') || priceId?.includes('SL6QFFk77knaVvarSHwZKou')) plan = 'pro';
        if (priceId.includes('1S6BTTF') || priceId?.includes('1S6BTWF')) plan = 'clinic';
        const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
        if (interval === 'year') billing_cycle = 'yearly';
      }
      // Normalize status to our enum
      const subStatus = sub.status as string;
      if (subStatus === 'canceled' || subStatus === 'cancelled') status = 'cancelled';
      else if (subStatus === 'past_due') status = 'past_due';
      else if (subStatus === 'unpaid') status = 'unpaid';
      else status = 'active';
    }

    // Upsert subscription immediately
    if (stripe_subscription_id) {
      // Prevent duplicate active subscriptions: check and deactivate existing ones
      if (status === 'active') {
        const { data: existingActive, error: checkError } = await supabaseAdmin
          .from('subscriptions')
          .select('id, stripe_subscription_id, plan')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .neq('stripe_subscription_id', stripe_subscription_id);
        
        if (!checkError && existingActive && existingActive.length > 0) {
          console.log(`⚠️ Found ${existingActive.length} existing active subscription(s) for user ${user.id}. Deactivating before activating new subscription.`);
          
          // Deactivate existing active subscriptions
          const { error: deactivateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('status', 'active')
            .neq('stripe_subscription_id', stripe_subscription_id);
          
          if (deactivateError) {
            console.error(`❌ Error deactivating existing subscriptions:`, deactivateError);
            // Continue anyway - the database trigger will handle it
          } else {
            console.log(`✅ Deactivated ${existingActive.length} existing active subscription(s)`);
          }
        }
      }
      
      const { error: upErr } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_subscription_id,
          plan,
          billing_cycle,
          status,
          price_id: priceId || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });
      if (upErr) {
        return new Response(JSON.stringify({ error: 'Failed to upsert subscription', details: upErr.message }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ success: true, plan, billing_cycle, stripe_subscription_id }), { status: 200, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('verify-checkout error:', e);
    return new Response(JSON.stringify({ error: 'Internal error', details: e?.message }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  }
});


