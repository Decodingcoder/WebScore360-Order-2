'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This component handles listening to Supabase auth changes client-side
// and performs redirects based on the session status.
export default function AuthListener() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log('AuthListener - Setting up listener')

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`AuthListener - Event: ${event}`)
        if (event === 'SIGNED_IN' && session) {
          console.log('AuthListener - User signed in, redirecting to dashboard')
          // TODO: Potentially check current path to avoid redirect loops if already on dashboard?
          // TODO: Handle 'next' parameter if needed for specific redirects post-login
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthListener - User signed out, redirecting to login')
          // Ensure redirect doesn't happen if already on login/public pages
          // TODO: Add more robust path checking if needed
          if (window.location.pathname !== '/login') {
            router.push('/login')
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('AuthListener - Initial session processed.')
          // Optional: Could redirect here if initial session exists and not on protected route,
          // but middleware might handle this better server-side.
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
