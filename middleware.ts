import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SHARIK CRM Production Middleware
 * - Enforces server-side Supabase session authentication on all private routes.
 * - Injects security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy).
 * - Redirects unauthenticated users to /login.
 * - Protects API routes with 401 responses.
 */

// Routes that do NOT require authentication
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/our-services',
]);

// Route prefixes that do NOT require authentication
const PUBLIC_PREFIXES = [
  '/auth/',
  '/api/webhooks/',  // Authenticated via HMAC signature
  '/api/v1/',        // Authenticated via X-API-Key header
];

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.qrserver.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // --- Inject Security Headers on every response ---
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // --- Pass-through for public routes ---
  if (PUBLIC_ROUTES.has(pathname)) return res;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return res;
  }

  // --- Server-Side Session Validation ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) return res; // Fail-open if env not configured

  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
      || request.cookies.get(`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`)?.value;

    if (!accessToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Valid session required.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Validate the token against Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Session expired or invalid.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // On unexpected error: fail-open for pages (don't lock users out), fail-closed for APIs
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Session validation failed.' },
        { status: 503 }
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
