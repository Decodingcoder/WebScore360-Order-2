'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallbackHandler() {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Check for 'next' query param if needed for post-auth redirect - REMOVED as redirect handled elsewhere
  // const nextPath = searchParams.get('next') || '/dashboard'

  useEffect(() => {
    const processHashParams = async () => {
      try {
        setIsProcessing(true)
        console.log('Auth Callback Handler - Processing hash parameters')

        // Get the hash fragment without the #
        const hash = window.location.hash.substring(1)
        if (!hash) {
          // If no hash, maybe it's an error from Supabase/Google?
          // Check query params for error description
          const errorDesc = searchParams.get('error_description')
          if (errorDesc) {
            throw new Error(errorDesc)
          }
          throw new Error('No hash fragment found in URL.')
        }

        // Parse the hash parameters
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token') // May be null depending on flow

        if (!accessToken) {
          throw new Error('No access token found in URL hash.')
        }

        console.log(
          'Auth Callback Handler - Access token found, setting session.'
        )

        // Initialize Supabase client
        const supabase = createClient()

        // Set the session using the extracted tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '', // Provide empty string if null
        })

        if (sessionError) {
          throw sessionError
        }

        console.log('Auth Callback Handler - Session established successfully.')

        // Clear the hash
        window.location.hash = ''

        // Force a server refresh to ensure middleware picks up the new session
        console.log('Auth Callback Handler - Refreshing router...')
        router.refresh()

        // Now redirect to dashboard (middleware should allow this after refresh)
        console.log('Auth Callback Handler - Redirecting to dashboard...')
        router.push('/dashboard')
      } catch (err) {
        console.error('Auth Callback Handler - Error processing session:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to establish session'
        setError(errorMessage)
        // Redirect to login after a brief delay, passing the error
        setTimeout(() => {
          router.push(`/login?message=${encodeURIComponent(errorMessage)}`)
        }, 3000)
      } finally {
        // Set processing to false only if there was an error, otherwise refresh/redirect handles UI change
        if (error) {
          setIsProcessing(false)
        }
      }
    }

    processHashParams()
    // Prevent running multiple times if parameters change unexpectedly during processing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  // Basic UI to show progress or errors
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center">
          {isProcessing
            ? 'Processing authentication...'
            : error
            ? 'Authentication Error'
            : 'Redirecting...'}
        </h1>

        {isProcessing && (
          <div className="flex justify-center">
            {/* Basic spinner */}
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            <p>{error}</p>
            <p className="mt-2 text-sm">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}
