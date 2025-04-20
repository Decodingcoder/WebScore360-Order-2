'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SessionHandlerContent() {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'

  useEffect(() => {
    const processHashParams = async () => {
      try {
        setIsProcessing(true)
        console.log('Session handler - Processing hash parameters')

        // Get the hash fragment without the #
        const hash = window.location.hash.substring(1)
        if (!hash) {
          throw new Error('No hash fragment found in URL')
        }

        // Parse the hash parameters
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken) {
          throw new Error('No access token found in URL hash')
        }

        console.log('Session handler - Access token found, setting session')

        // Initialize Supabase client
        const supabase = createClient()

        // Set the session using the extracted tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (error) {
          throw error
        }

        console.log('Session handler - Session established successfully')

        // Redirect to the intended destination
        router.push(nextPath)
      } catch (err) {
        console.error('Session handler - Error processing session:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to establish session'
        )
        // Redirect to login after a brief delay
        setTimeout(() => {
          router.push(
            `/login?error=${encodeURIComponent('Failed to establish session')}`
          )
        }, 3000)
      } finally {
        setIsProcessing(false)
      }
    }

    processHashParams()
  }, [router, nextPath])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center">
          {isProcessing
            ? 'Establishing your session...'
            : error
            ? 'Session Error'
            : 'Redirecting...'}
        </h1>

        {isProcessing && (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
            <p className="mt-2 text-sm">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}
