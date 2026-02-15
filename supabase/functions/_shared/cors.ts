/**
 * Shared CORS headers utility for Edge Functions
 */

export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://theramate.co.uk',
    'https://www.theramate.co.uk',
    'https://app.theramate.co.uk',
    'https://peercareconnect.com',
    'https://www.peercareconnect.com'
  ];

  // Get allowed origins from environment if set
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(',').map(o => o.trim()));
  }

  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
}
