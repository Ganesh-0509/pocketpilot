import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a Supabase client configured to use cookies
  // This also refreshes the auth token on every request
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: { [key: string]: unknown } }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session to keep the user logged in
  await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/semester-planner',
    '/coach',
    '/expenses',
    '/goals',
    '/badges',
    '/settings',
    '/onboarding',
  ];

  // Public routes that should never redirect
  const publicRoutes = ['/login', '/signup', '/'];
  const apiHealthRoute = '/api/health';

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is public auth-related
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname) || pathname === apiHealthRoute;

  // Get the session data
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ============================================================================
  // RULE 1: No session + protected route → redirect to login
  // ============================================================================
  if (!session && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================================================
  // RULE 2: Has session + on login/signup page → redirect to dashboard
  // ============================================================================
  if (session && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================================================
  // RULE 3: All other requests pass through (public routes, API endpoints, etc.)
  // ============================================================================
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/ (public assets)
     * 
     * This ensures middleware runs on all protected routes but skips Next.js internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
