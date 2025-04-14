'use client'

/* Commented for bypass */
// import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomeForm() {
  const [websiteUrl, setWebsiteUrl] = useState('example.com')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    /* Commented for bypass */
    // setIsLoading(true)
    setError(null)

    try {
      // Basic URL validation - just make sure it's not empty
      if (!websiteUrl.trim()) {
        throw new Error('Please enter a website URL')
      }

      // BYPASS: Skip audit creation and navigate directly to dashboard
      console.log('Bypassing audit creation for URL:', websiteUrl)
      router.push('/dashboard')

      /* Commented for bypass
      // Validate URL format - allow domains without http/https
      let processedUrl = websiteUrl.trim()
      
      // If URL doesn't start with http:// or https://, add https://
      if (!processedUrl.match(/^https?:\/\//)) {
        processedUrl = `https://${processedUrl}`
      }
      
      // Check if it's a valid URL/domain format
      if (!processedUrl.match(/^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/.*)?$/)) {
        throw new Error('Please enter a valid website URL or domain name')
      }

      // MOCK: Simulate a successful form submission
      console.log("Website to analyze:", processedUrl)
      
      // Simulate successful submission
      setTimeout(() => {
        setSuccess(true)
        setIsLoading(false)
        setWebsiteUrl('')
      }, 1500)
      */
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      /* Commented for bypass */
      // setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Analysis Started!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We&apos;re analyzing your website. Your results will be available on
          the dashboard shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Analyze Another Website
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">
          Website URL
        </label>
        <input
          id="websiteUrl"
          type="text"
          placeholder="example.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter domain name (e.g., example.com) or full URL
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-800 dark:text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <>
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
            <span>Sign in with Google</span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Sign in to access your audits and dashboard. No credit card required.
      </p>
    </form>
  )
}
