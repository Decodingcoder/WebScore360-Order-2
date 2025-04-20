'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    handleSignInWithGoogle?: (response: any) => void
  }
}

const OneTapComponent = () => {
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async function handleSignInWithGoogle(response: any) {
    // const router = useRouter() // Initialize router
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    })

    if (error) {
      console.error('Error signing in with Google:', error.message)
      // Optionally redirect to an error page or show a message
    } else {
      // Redirect to the dashboard or desired page upon successful login
      // Make sure the browser refreshes or navigates to fully load the new session
      router.push('/dashboard')
      router.refresh() // Ensure layout re-renders with new auth state
    }
  }

  useEffect(() => {
    window.handleSignInWithGoogle = handleSignInWithGoogle
    return () => {
      delete window.handleSignInWithGoogle
    }
    // We need a way to pass handleSignInWithGoogle to useEffect below,
    // but function definitions inside useEffect are tricky with dependencies.
    // Attaching to window works for the data-callback, but not ideal.
    // Let's keep it for now but acknowledge it's not perfect.
  }, [router]) // Added router dependency

  useEffect(() => {
    // Check if the Google library is loaded
    const googleScriptLoaded =
      typeof window.google?.accounts?.id !== 'undefined'
    const buttonContainer = document.getElementById('google-signin-button')

    if (googleScriptLoaded && buttonContainer) {
      // Check both script and element
      window.google.accounts.id.renderButton(
        buttonContainer, // Pass the confirmed element
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 400, // Changed to number
        } // Configuration options
      )
    } else {
      if (!googleScriptLoaded) {
        console.log('Google script not loaded yet for button rendering.')
      }
      if (!buttonContainer) {
        console.log('Google signin button element not found.')
      }
      // Consider adding a listener or timeout/retry if needed
    }
  }, []) // Empty dependency array ensures this runs once after mount

  return (
    <>
      {/* Load the GSI client library */}
      <Script src="https://accounts.google.com/gsi/client" async defer />

      {/* One Tap prompt configuration - Keep this as is */}
      <div
        id="g_id_onload"
        data-client_id="845104135306-8k7qjt5d95nqtbu034ql1f2g0ih167n0.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false"
      ></div>

      {/* Container for the Google Sign-In button - Rendered via JS */}
      <div id="google-signin-button"></div>
      {/* Removed the old data-* attributes driven button div */}
    </>
  )
}

export default OneTapComponent
