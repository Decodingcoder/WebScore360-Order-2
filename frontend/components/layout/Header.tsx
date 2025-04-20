'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import type { Session } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Header() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

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
        <nav className="flex items-center space-x-4 md:space-x-6">
          {/* Common Nav Links */}
          <Link
            href="/#features"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hidden sm:inline-block"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hidden sm:inline-block"
          >
            FAQ
          </Link>

          {/* Conditional Auth Button */}
          {!mounted || isLoading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /> // Placeholder
          ) : session ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
