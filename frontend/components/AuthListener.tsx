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
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      // Only handle SIGNED_OUT events
      if (event === 'SIGNED_OUT') {
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          router.push('/login')
        }
      }
    })

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  // This component doesn't render anything itself
  return null
}
