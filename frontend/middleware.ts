import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
  console.log(
    `Middleware - Processing request for: ${request.nextUrl.pathname}`
  )

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value
          console.log(
            `Middleware - Cookie ${name}: ${cookie ? 'present' : 'missing'}`
          )
          return cookie
        },
        set(name: string, value: string, options) {
          console.log(`Middleware - Setting cookie: ${name}`)
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          console.log(`Middleware - Removing cookie: ${name}`)
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log(
      `Middleware - Session check result: ${
        session ? 'Authenticated' : 'Not authenticated'
      }`
    )
    if (session) {
      console.log(`Middleware - User ID: ${session.user?.id}`)
    }

    // Skip auth check for session handler page (breaks chicken-and-egg problem)
    if (request.nextUrl.pathname.startsWith('/auth/session-handler')) {
      console.log('Middleware - Skipping auth check for session handler page')
      return response
    }

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/reports', '/account']
    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    )
    console.log(`Middleware - Protected route: ${isProtectedRoute}`)

    // If it's a protected route and the user is not logged in, redirect to login page
    if (isProtectedRoute && !session) {
      console.log(
        'Middleware - Redirecting to login (protected route, no session)'
      )
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is already logged in and tries to access login, redirect to dashboard
    if (session && request.nextUrl.pathname === '/login') {
      console.log(
        'Middleware - Redirecting to dashboard (already authenticated)'
      )
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware - Error checking session:', error)
    // On error, allow the request to continue to avoid blocking the user
    return response
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/account/:path*',
    '/login',
    '/auth/callback',
  ],
}
