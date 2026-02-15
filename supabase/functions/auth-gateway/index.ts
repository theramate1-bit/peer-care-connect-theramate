import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers - restrict to allowed origins in production
const getAllowedOrigin = (): string => {
  const origin = Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowedOrigins = origin.split(',').map(o => o.trim()).filter(Boolean);
  
  // In production, use specific origins; in development, allow localhost
  if (allowedOrigins.length > 0) {
    return allowedOrigins[0];
  }
  
  // Default: allow all in development, restrict in production
  return Deno.env.get('ENVIRONMENT') === 'production' ? '' : '*';
};

const corsHeaders = (origin?: string | null): Record<string, string> => {
  const allowedOrigin = getAllowedOrigin();
  const requestOrigin = origin || '*';
  
  // In production, validate origin; in development, allow all
  const corsOrigin = allowedOrigin === '*' || Deno.env.get('ENVIRONMENT') !== 'production'
    ? '*'
    : (allowedOrigin.includes(requestOrigin) ? requestOrigin : '');
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/functions\/v1\/auth-gateway/, '') || '/';

  // Validate path (prevent path traversal attacks)
  if (path.includes('..') || path.includes('//') || path.length > 200) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('Authorization');
  
  // Validate Authorization header format if provided
  if (authHeader && !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Authorization header must use Bearer token format' }), {
      status: 401,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {}
    }
  });

  try {
    // Fetch the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthenticated', redirect_hint: '/login' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Load user profile to evaluate policy
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, user_role, onboarding_status, profile_completed, stripe_connect_account_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: 'profile_load_failed' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const isPractitioner = ['sports_therapist', 'massage_therapist', 'osteopath'].includes(profile.user_role);

    // Enforce onboarding for practitioners
    if (isPractitioner && (profile.onboarding_status !== 'completed' || !profile.profile_completed)) {
      return new Response(JSON.stringify({ error: 'onboarding_incomplete', redirect_hint: '/onboarding' }), {
        status: 451,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Compute subscription + connect access for practitioners and expose plan
    let hasActiveSubscription = false;
    let plan: string | null = null;
    let billing_cycle: string | null = null;
    if (isPractitioner) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, plan, billing_cycle')
        .eq('user_id', user.id)
        .in('status', ['active'])
        .maybeSingle();

      hasActiveSubscription = !!sub;
      plan = sub?.plan ?? null;
      billing_cycle = sub?.billing_cycle ?? null;
      const hasConnect = !!profile.stripe_connect_account_id;
      const practitionerAccess = hasActiveSubscription && hasConnect;

      if (!practitionerAccess) {
        return new Response(JSON.stringify({ error: 'subscription_required', redirect_hint: '/pricing' }), {
          status: 403,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoints
    if (path === '/policy' || path === '/') {
      return new Response(JSON.stringify({ ok: true, plan, billing_cycle }), {
        status: 200,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Default: not found for now (no proxying implemented in v1)
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'internal_error', message: e?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


