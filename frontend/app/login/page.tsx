'use client' // Auth UI requires client-side interaction

import { Footer } from '@/components/Footer'
import LoginErrorMessage from '@/components/LoginErrorMessage'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

export default function LoginPage() {
  const supabase = createClient()

  // Determine the redirect URL based on the environment
  // In production, use the environment variable. Fallback for local dev.
  const redirectBase =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  // Point redirectTo back to the login page itself for Auth UI
  const redirectTo = `${redirectBase}/login`

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="WebScore360 Logo"
            width={100}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                Welcome to WebScore360
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to access your dashboard and reports
              </p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              onlyThirdPartyProviders
              redirectTo={redirectTo}
              theme="dark"
            />

            <Suspense fallback={null}>
              <LoginErrorMessage />
            </Suspense>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                By continuing, you agree to WebScore360&apos;s Terms of Service
                and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
