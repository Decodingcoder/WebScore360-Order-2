import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Create a minimal Supabase client for the code exchange only
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => '',
          set: () => {},
          remove: () => {},
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      // If there's an error, redirect with error message
      console.error('Authentication error:', error.message)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      )
    } catch (err) {
      console.error('Unexpected auth error:', err)
      return NextResponse.redirect(
        `${origin}/login?error=unexpected-auth-error`
      )
    }
  }

  // Missing code parameter
  return NextResponse.redirect(`${origin}/login?error=missing-code-parameter`)
}
