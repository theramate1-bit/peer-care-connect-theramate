/**
 * Rate Limiting for Edge Functions
 * Prevents abuse and DoS attacks
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string; // User ID, IP address, or other identifier
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict limits for authentication endpoints
  AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  // Moderate limits for payment endpoints
  PAYMENT: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  // Standard limits for general API endpoints
  API: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  // Lenient limits for read operations
  READ: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 requests per minute
};

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    // If Supabase not available, allow request but log warning
    console.warn('Rate limiting unavailable: Supabase not configured');
    return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowMs };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const key = `rate_limit:${config.identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('count, reset_at')
      .eq('key', key)
      .single();

    // If no record exists or expired, create new one
    if (fetchError || !existing || existing.reset_at < now) {
      const resetAt = now + config.windowMs;
      await supabase
        .from('rate_limits')
        .upsert({
          key,
          count: 1,
          reset_at: resetAt,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt
      };
    }

    // Check if limit exceeded
    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.reset_at,
        error: 'Rate limit exceeded'
      };
    }

    // Increment count
    const newCount = existing.count + 1;
    await supabase
      .from('rate_limits')
      .update({
        count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: existing.reset_at
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request but log
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
      error: 'Rate limit check failed'
    };
  }
}

/**
 * Get identifier for rate limiting (user ID or IP)
 */
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}
