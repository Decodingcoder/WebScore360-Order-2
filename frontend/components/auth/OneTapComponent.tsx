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

    const { data, error } = await supabase.auth.signInWithIdToken({
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

  // Use useEffect to attach the function to the window object
  useEffect(() => {
    // Assign the function to the window object
    window.handleSignInWithGoogle = handleSignInWithGoogle

    // Cleanup function to remove it when the component unmounts
    return () => {
      delete window.handleSignInWithGoogle
    }
  }, [])

  // useEffect(() => {
  //   const initializeGoogleOneTap = () => {
  //     console.log('Initializing Google One Tap')
  //     window.addEventListener('load', async () => {
  //       const [nonce, hashedNonce] = await generateNonce()
  //       console.log('Nonce: ', nonce, hashedNonce)

  //       // check if there's already an existing session before initializing the one-tap UI
  //       const { data, error } = await supabase.auth.getSession()
  //       if (error) {
  //         console.error('Error getting session', error)
  //       }
  //       if (data.session) {
  //         router.push('/')
  //         return
  //       }

  //       /* global google */
  //       google.accounts.id.initialize({
  //         client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  //         callback: async (response: CredentialResponse) => {
  //           try {
  //             // send id token returned in response.credential to supabase
  //             const { data, error } = await supabase.auth.signInWithIdToken({
  //               provider: 'google',
  //               token: response.credential,
  //               nonce,
  //             })

  //             if (error) throw error
  //             console.log('Session data: ', data)
  //             console.log('Successfully logged in with Google One Tap')

  //             // redirect to protected page
  //             router.push('/')
  //           } catch (error) {
  //             console.error('Error logging in with Google One Tap', error)
  //           }
  //         },
  //         nonce: hashedNonce,
  //         // with chrome's removal of third-party cookiesm, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
  //         use_fedcm_for_prompt: true,
  //       })
  //       google.accounts.id.prompt() // Display the One Tap UI
  //     })
  //   }
  //   initializeGoogleOneTap()
  //   return () => window.removeEventListener('load', initializeGoogleOneTap)
  // }, [])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" />

      <div
        id="g_id_onload"
        data-client_id="845104135306-8k7qjt5d95nqtbu034ql1f2g0ih167n0.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="continue_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="400"
      ></div>
    </>
  )
}

export default OneTapComponent
