'use client' // Auth UI requires client-side interaction

import AuthForm from '@/components/AuthForm'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/layout/Header'
import LoginErrorMessage from '@/components/LoginErrorMessage'
import { createClient } from '@/utils/supabase/client'
import { Suspense } from 'react'

export default function LoginPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async function handleSignInWithGoogle(response: any) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <script src="https://accounts.google.com/gsi/client" async></script>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center pt-28">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome to WebScore360</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your dashboard and reports
            </p>
          </div>

          <AuthForm />

          <Suspense fallback={null}>
            <div className="mt-4">
              <LoginErrorMessage />
            </div>
          </Suspense>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              By continuing, you agree to WebScore360&apos;s Terms of Service
              and Privacy Policy
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
