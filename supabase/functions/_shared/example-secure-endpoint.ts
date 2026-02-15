/**
 * Example Secure Edge Function
 * Demonstrates CSRF protection, rate limiting, and security headers
 * 
 * Copy this pattern to secure your Edge Functions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { securityHeaders } from './security-headers.ts';
import { 
  requiresCSRFProtection, 
  getCSRFTokenFromRequest, 
  validateCSRFToken 
} from './csrf.ts';
import { 
  checkRateLimit, 
  getRateLimitIdentifier, 
  RATE_LIMITS 
} from './rate-limit.ts';

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { ...corsHeaders(origin), ...securityHeaders(origin) } 
    });
  }

  try {
    // 1. Authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!);
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders(origin), 
            ...securityHeaders(origin),
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 2. Rate Limiting
    const identifier = getRateLimitIdentifier(req, user.id);
    const rateLimitResult = await checkRateLimit({
      ...RATE_LIMITS.API,
      identifier
    });

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          resetAt: rateLimitResult.resetAt 
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders(origin), 
            ...securityHeaders(origin),
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMITS.API.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString()
          } 
        }
      );
    }

    // 3. CSRF Protection for state-changing methods
    if (requiresCSRFProtection(req.method)) {
      const csrfToken = getCSRFTokenFromRequest(req);
      const csrfValidation = await validateCSRFToken(csrfToken, user.id, supabase);
      
      if (!csrfValidation.valid) {
        return new Response(
          JSON.stringify({ error: csrfValidation.error || 'Invalid CSRF token' }), 
          { 
            status: 403, 
            headers: { 
              ...corsHeaders(origin), 
              ...securityHeaders(origin),
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }

    // 4. Process request
    const body = await req.json();
    
    // Your business logic here
    const result = {
      success: true,
      data: body,
      userId: user.id
    };

    return new Response(
      JSON.stringify(result), 
      { 
        status: 200, 
        headers: { 
          ...corsHeaders(origin), 
          ...securityHeaders(origin),
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders(origin), 
          ...securityHeaders(origin),
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
