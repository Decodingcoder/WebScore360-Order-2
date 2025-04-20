'use client'

import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for authenticated layouts
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isLoading, session, user } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [hasLocalAuth, setHasLocalAuth] = useState(false)

  // Check for auth tokens in localStorage - this is a safety check
  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      // Check if auth data exists in localStorage - any of these keys would indicate a logged-in state
      const hasToken =
        localStorage.getItem('sb-auth-token') ||
        localStorage.getItem('supabase.auth.token') ||
        localStorage.getItem('sb-refresh-token')
      setHasLocalAuth(!!hasToken)
      console.log('Auth token found in localStorage:', !!hasToken)
    }
  }, [])

  // Wait for authentication state to stabilize before redirecting
  useEffect(() => {
    // Only consider auth check complete after loading has finished
    if (!isLoading) {
      // Use a longer delay to ensure auth state is stable
      const timer = setTimeout(() => {
        setAuthChecked(true)

        // If we have session or user, we're authenticated
        const isAuthenticated = !!session || !!user

        // Only redirect if:
        // 1. No session AND no user from AuthContext
        // 2. No auth tokens in localStorage (failsafe)
        // 3. Loading has completed
        if (!isAuthenticated && !hasLocalAuth) {
          console.log('No auth detected, redirecting to login')
          router.push('/login')
        }
      }, 1500) // Longer delay to ensure auth state is stable

      return () => clearTimeout(timer)
    }
  }, [isLoading, session, user, router, hasLocalAuth])

  // Show loading state while authentication is being checked
  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  // Even if auth context isn't ready but we found local auth, show the dashboard
  // This prevents flashing/redirects when refreshing
  if (!session && !user && !hasLocalAuth) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
