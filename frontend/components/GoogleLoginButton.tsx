'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('Error during sign in:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to sign in with Google'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        loading={isLoading}
        variant="google"
        className="w-full"
      >
        {!isLoading && (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.1711 8.36788H17.4998V8.33329H9.99984V11.6666H14.7094C14.0223 13.607 12.1761 15 9.99984 15C7.23859 15 4.99984 12.7612 4.99984 10C4.99984 7.23871 7.23859 5 9.99984 5C11.2744 5 12.4344 5.48683 13.3169 6.28525L15.674 3.92821C14.1857 2.56954 12.1948 1.66663 9.99984 1.66663C5.39775 1.66663 1.6665 5.39787 1.6665 10C1.6665 14.6021 5.39775 18.3333 9.99984 18.3333C14.6019 18.3333 18.3332 14.6021 18.3332 10C18.3332 9.44217 18.2757 8.89792 18.1711 8.36788Z"
              fill="#FFC107"
            />
            <path
              d="M2.62744 6.12121L5.36536 8.12913C6.10619 6.29496 7.90036 5 9.99994 5C11.2745 5 12.4345 5.48683 13.317 6.28525L15.6741 3.92821C14.1857 2.56954 12.1949 1.66663 9.99994 1.66663C6.74994 1.66663 3.92077 3.48871 2.62744 6.12121Z"
              fill="#FF3D00"
            />
            <path
              d="M10.0001 18.3334C12.1522 18.3334 14.1063 17.4613 15.5855 16.14L13.0109 13.9875C12.1516 14.6452 11.0964 15.0009 10.0001 15C7.83427 15 5.99394 13.6179 5.2989 11.6892L2.58057 13.7829C3.8614 16.4517 6.7239 18.3334 10.0001 18.3334Z"
              fill="#4CAF50"
            />
            <path
              d="M18.171 8.36796H17.5V8.33337H10V11.6667H14.7097C14.3809 12.5902 13.7889 13.3972 13.0106 13.9876L13.0118 13.9867L15.5864 16.1392C15.4084 16.3004 18.3334 14.1667 18.3334 10C18.3334 9.44225 18.2759 8.898 18.171 8.36796Z"
              fill="#1976D2"
            />
          </svg>
        )}
        <span>Sign in with Google</span>
      </Button>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
