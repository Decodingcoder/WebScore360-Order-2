'use client' // Auth UI requires client-side interaction

import AuthForm from '@/components/AuthForm'
import { Footer } from '@/components/Footer'
import LoginErrorMessage from '@/components/LoginErrorMessage'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client' // Import client
import type { Session } from '@supabase/supabase-js' // Import Session type
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'

export default function LoginPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient() // Create client instance

  // Handle client-side only rendering for auth check
  useEffect(() => {
    setMounted(true)

    const getSessionData = async () => {
      setIsLoading(true)
      const {
        data: { session: fetchedSession },
      } = await supabase.auth.getSession()
      setSession(fetchedSession)
      setIsLoading(false)
    }
    getSessionData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 z-50 py-4 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="WebScore360 Logo"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <nav className="flex gap-3">
            {/* Show loading or based on session */}
            {!mounted || isLoading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /> // Placeholder
            ) : session ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="#pricing">Pricing</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

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
