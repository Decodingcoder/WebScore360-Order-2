import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin, hash } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine the correct origin: Use env var if available, otherwise fallback to request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin
  console.log(`Auth callback - Using site URL for redirect: ${siteUrl}`)
  console.log(`Auth callback - Request URL: ${request.url}`)
  console.log(`Auth callback - Code present: ${!!code}`)
  console.log(`Auth callback - Next path: ${next}`)

  // Create Supabase client
  const supabase = createClient()

  // Check for existing session first
  const { data: sessionData } = await supabase.auth.getSession()
  console.log(`Auth callback - Existing session: ${!!sessionData.session}`)

  if (code) {
    console.log('Auth callback - Processing code exchange')
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error(
          'Auth callback - Error exchanging code for session:',
          error
        )
        return NextResponse.redirect(
          `${siteUrl}/login?error=${encodeURIComponent(
            'Authentication failed: ' + error.message
          )}`
        )
      }

      console.log('Auth callback - Session established successfully')
      console.log(`Auth callback - User ID: ${data?.session?.user?.id}`)

      // Create a response with redirect
      const response = NextResponse.redirect(`${siteUrl}${next}`)

      // Set cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0')

      return response
    } catch (err) {
      console.error(
        'Auth callback - Unexpected error during code exchange:',
        err
      )
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(
          'Unexpected authentication error'
        )}`
      )
    }
  } else if (hash && hash.includes('access_token')) {
    // Handle hash fragments that might contain tokens (from implicit flow)
    console.log('Auth callback - Hash fragment with tokens detected')

    // We can't process the hash server-side, so redirect to client handler
    return NextResponse.redirect(
      `${siteUrl}/auth/session-handler${hash}?next=${encodeURIComponent(next)}`
    )
  } else if (sessionData.session) {
    // If we already have a valid session, just redirect to the destination
    console.log('Auth callback - Using existing session for redirect')
    return NextResponse.redirect(`${siteUrl}${next}`)
  } else {
    // No code, no hash with tokens, and no session - redirect to login
    console.log(
      'Auth callback - No authentication data found, redirecting to login'
    )
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(
        'No authentication data found'
      )}`
    )
  }
}
