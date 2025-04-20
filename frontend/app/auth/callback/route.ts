import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine the correct origin: Use env var if available, otherwise fallback to request origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin
  console.log(`Using site URL for redirect: ${siteUrl}`)

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to login page using the determined site URL
      return NextResponse.redirect(
        `${siteUrl}/login?error=Authentication failed`
      )
    }
  }

  // URL to redirect to after sign in process completes, using determined site URL
  return NextResponse.redirect(`${siteUrl}${next}`)
}
