/**
 * CSRF Protection for Edge Functions
 * Implements token-based CSRF protection for state-changing operations
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Generate CSRF token based on user session
 */
export async function generateCSRFToken(userId: string, supabase: any): Promise<string> {
  // Get user's session token from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Create token hash from session token + secret
  const secret = Deno.env.get('CSRF_SECRET') || 'csrf-secret-change-in-production';
  const tokenData = `${session.access_token}:${userId}:${secret}`;
  
  // Use Web Crypto API to create hash
  const encoder = new TextEncoder();
  const data = encoder.encode(tokenData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Store token in database with expiration (5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  await supabase
    .from('csrf_tokens')
    .upsert({
      user_id: userId,
      token,
      expires_at: expiresAt
    }, {
      onConflict: 'user_id'
    });

  return token;
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(
  token: string | null,
  userId: string,
  supabase: any
): Promise<{ valid: boolean; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing CSRF token' };
  }

  // Check token in database
  const { data: storedToken, error } = await supabase
    .from('csrf_tokens')
    .select('token, expires_at')
    .eq('user_id', userId)
    .eq('token', token)
    .single();

  if (error || !storedToken) {
    return { valid: false, error: 'Invalid CSRF token' };
  }

  // Check expiration
  const expiresAt = new Date(storedToken.expires_at);
  if (expiresAt < new Date()) {
    // Clean up expired token
    await supabase
      .from('csrf_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);
    
    return { valid: false, error: 'CSRF token expired' };
  }

  return { valid: true };
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return stateChangingMethods.includes(method.toUpperCase());
}

/**
 * Extract CSRF token from request headers
 */
export function getCSRFTokenFromRequest(req: Request): string | null {
  return req.headers.get('X-CSRF-Token') || req.headers.get('x-csrf-token');
}
