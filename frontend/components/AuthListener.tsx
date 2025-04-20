'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This component handles listening to Supabase auth changes client-side
// primarily for SIGNED_OUT events.
export default function AuthListener() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log('AuthListener - Setting up listener')

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event /*, _session */) => {
        console.log(`AuthListener - Event: ${event}`)
        // Removed SIGNED_IN handler - Middleware should handle redirecting logged-in users from /login
        // and protecting /dashboard.
        if (event === 'SIGNED_OUT') {
          console.log('AuthListener - User signed out, redirecting to login')
          // TODO: Add more robust path checking if needed to avoid unnecessary redirects
          if (window.location.pathname !== '/login') {
            router.push('/login')
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('AuthListener - Initial session processed.')
          // We could potentially check if session exists and user is on '/' and redirect to '/dashboard'
          // but let's rely on middleware + user navigation for now.
        }
      }
    )

    // Cleanup listener on component unmount
    return () => {
      console.log('AuthListener - Cleaning up listener')
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  // This component doesn't render anything itself
  return null
}
