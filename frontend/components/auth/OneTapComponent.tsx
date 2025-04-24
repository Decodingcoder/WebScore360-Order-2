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

  // Keep this useEffect to attach the callback to window
  useEffect(() => {
    window.handleSignInWithGoogle = handleSignInWithGoogle
    return () => {
      delete window.handleSignInWithGoogle
    }
  }, [router])

  // Function to render the button - will be called by Script onReady
  const renderGoogleButton = () => {
    if (typeof window.google?.accounts?.id === 'undefined') {
      console.error('Google script not loaded yet, cannot render button.')
      return // Exit if google object isn't ready
    }

    const buttonContainer = document.getElementById('google-signin-button')
    if (buttonContainer) {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
      })
      // Optionally call prompt here if needed
      // window.google.accounts.id.prompt();
    } else {
      console.error('Google signin button element not found.')
    }
  }

  return (
    <>
      {/* Load the GSI client library and call renderGoogleButton when ready */}
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onReady={renderGoogleButton} // Call render function when script is ready
      />

      {/* One Tap prompt configuration */}
      <div
        id="g_id_onload"
        data-client_id="845104135306-8k7qjt5d95nqtbu034ql1f2g0ih167n0.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false"
      ></div>

      {/* Container for the Google Sign-In button */}
      <div id="google-signin-button"></div>
    </>
  )
}

export default OneTapComponent
