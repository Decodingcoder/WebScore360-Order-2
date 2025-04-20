'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This component listens for SIGNED_OUT events and redirects to login page
export default function AuthListener() {
  const router = useRouter()
  const { session } = useAuth()

  useEffect(() => {
    // Only handle navigation to login when session becomes null
    // (which happens on sign out in the AuthContext)
    // Don't redirect from home page or login page
    const currentPath = window.location.pathname
    if (
      session === null &&
      currentPath !== '/login' &&
      currentPath !== '/' &&
      !currentPath.startsWith('/auth/')
    ) {
      router.push('/login')
    }
  }, [session, router])

  // This component doesn't render anything itself
  return null
}
