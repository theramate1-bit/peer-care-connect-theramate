import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

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
  
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  
  // Validate this is a POST request (admin function)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }

  // Validate Authorization header (should be service role or admin)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bucket = 'recordings';
    const maxAgeDays = Number(Deno.env.get('RECORDINGS_MAX_AGE_DAYS') || '14');
    
    // Validate maxAgeDays is a reasonable number
    if (isNaN(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 365) {
      return new Response(JSON.stringify({ error: 'Invalid RECORDINGS_MAX_AGE_DAYS (must be between 1 and 365)' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }
    
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    // list paginated
    let token: string | undefined;
    let removed = 0;
    do {
      const { data, error } = await supabase.storage.from(bucket).list('', { token, limit: 1000 });
      if (error) break;
      for (const item of data ?? []) {
        const last = new Date(item.created_at ?? item.updated_at ?? Date.now()).getTime();
        if (last < cutoff) {
          await supabase.storage.from(bucket).remove([item.name]);
          removed++;
        }
      }
      token = undefined; // storage.list token-less simple paging
    } while (false);

    return new Response(JSON.stringify({ removed }), { status: 200, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
  }
});


