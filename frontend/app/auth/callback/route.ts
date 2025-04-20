import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// This route handler is specifically for the server-side authentication flow.
// It exchanges an authorization code for a session.
export async function GET(request: NextRequest) {
  // Log all incoming cookies for debugging PKCE issues
  console.log('Auth callback - Incoming cookies:', request.cookies.getAll())

  // Use request.nextUrl for reliable access to search params behind proxies
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log(
    `Auth callback - Received request. URL: ${
      request.url
    }, NextURL: ${request.nextUrl.toString()}`
  )

  // Use environment variable for site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error('Auth callback - Error: NEXT_PUBLIC_SITE_URL is not set.')
    // Cannot safely redirect without siteUrl, might need a static error page
    // For now, attempting redirect using origin from nextUrl as a fallback
    const fallbackOrigin = request.nextUrl.origin
    return NextResponse.redirect(
      `${fallbackOrigin}/login?message=Configuration error: Site URL not set`
    )
  }
  console.log(`Auth callback - Using site URL: ${siteUrl}`)
  console.log(`Auth callback - Code from nextUrl: ${code}, Next: ${next}`)

  if (code) {
    console.log('Auth callback - Attempting code exchange...')

    // Create Supabase client *specifically for Route Handler context*
    const cookieStore = request.cookies // Get cookies from the request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {
            // No-op for Route Handler context in this flow
          },
          remove() {
            // No-op for Route Handler context in this flow
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth callback - Code exchange successful. Redirecting...')
      // exchangeCodeForSession handles setting the session cookie on success.
      // The redirect carries the session cookie to the browser.
      return NextResponse.redirect(`${siteUrl}${next}`)
    } else {
      console.error('Auth callback - Code exchange failed:', error.message)
      // Log the specific error to understand PKCE/OAuth issues
    }
  } else {
    console.log(
      'Auth callback - No code found in request nextUrl searchParams.'
    )
  }

  // Redirect to login page if the code exchange fails or no code was present.
  console.error(
    'Auth callback - Redirecting to login due to error or missing code.'
  )
  return NextResponse.redirect(
    `${siteUrl}/login?message=Could not authenticate user`
  )
}
