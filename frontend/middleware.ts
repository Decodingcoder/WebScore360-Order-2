import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that are public and don't require authentication
const publicRoutes = [
  '/login',
  '/',
  '/auth/callback',
  '/signup',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Check if the current route is public or matches any public route prefix
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Skip auth check for public routes to avoid unnecessary API calls
  if (isPublicRoute && pathname !== '/login') {
    return response
  }

  // Create a Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value
          return cookie
        },
        set(name: string, value: string, options) {
          // Make sure cookies are set with same attributes as client-side
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
          })
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: -1,
          })
        },
      },
    }
  )

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Special handling for dashboard - check browser cookies directly as a fallback
  if (pathname.startsWith('/dashboard') && !session) {
    // Look for session in cookies as a backup
    const hasSessionCookie =
      request.cookies.has('supabase-auth-token') ||
      request.cookies.has('sb-auth-token')

    // If we find auth cookies, allow access and let client handle auth
    if (hasSessionCookie) {
      return response
    }
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    // Save the original URL to redirect after login
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Run middleware on all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|assets|favicon.ico|logo.png).*)',
  ],
}
