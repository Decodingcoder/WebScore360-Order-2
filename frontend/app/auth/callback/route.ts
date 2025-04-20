import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// This route handler is specifically for the server-side authentication flow.
// It exchanges an authorization code for a session.
export async function GET(request: Request) {
  console.log('Auth callback - Received request:', request.url)
  const { searchParams, origin: requestOrigin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  // Use environment variable for site URL, fallback to request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error('Auth callback - Error: NEXT_PUBLIC_SITE_URL is not set.')
    // Fallback or handle error appropriately - here redirecting to login with error
    return NextResponse.redirect(
      `${requestOrigin}/login?message=Configuration error: Site URL not set`
    )
  }
  console.log(`Auth callback - Using site URL: ${siteUrl}`)
  console.log(`Auth callback - Code: ${code}, Next: ${next}`)

  if (code) {
    console.log('Auth callback - Attempting code exchange...')
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth callback - Code exchange successful. Redirecting...')
      // Redirect to the specified path or dashboard after successful authentication.
      // Using siteUrl ensures we redirect to the correct domain.
      return NextResponse.redirect(`${siteUrl}${next}`)
    } else {
      console.error('Auth callback - Code exchange failed:', error.message)
    }
  } else {
    console.log('Auth callback - No code found in request URL.')
  }

  // Redirect to login page if the code exchange fails or no code was present.
  console.error(
    'Auth callback - Redirecting to login due to error or missing code.'
  )
  return NextResponse.redirect(
    `${siteUrl}/login?message=Could not authenticate user`
  )
}
