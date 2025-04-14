'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

interface AnalyzeFormProps {
  auditsRemaining: number
  subscription: 'free' | 'pro' | 'business_plus'
}

export default function AnalyzeForm({
  auditsRemaining,
  subscription,
}: AnalyzeFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const canRunAudit = subscription === 'business_plus' || auditsRemaining > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canRunAudit) {
      setError('You have no audits remaining. Please upgrade your plan.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Validate URL format
      if (
        !websiteUrl.match(
          /^(http|https):\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/.*)?$/
        )
      ) {
        throw new Error(
          'Please enter a valid website URL (including http:// or https://)'
        )
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Authentication session expired. Please login again.')
      }

      // Create a new audit record
      const { error: insertError } = await supabase.from('audits').insert({
        user_id: session.user.id,
        requested_email: session.user.email,
        website_url: websiteUrl,
        overall_score: null,
        performance_score: null,
        seo_score: null,
        conversion_score: null,
        branding_score: null,
        presence_score: null,
        raw_data: {},
      })

      if (insertError) throw new Error('Failed to submit your request')

      // Update user's remaining audits if not on business_plus plan
      if (subscription !== 'business_plus') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ audits_remaining: auditsRemaining - 1 })
          .eq('user_id', session.user.id)

        if (updateError)
          console.error('Failed to update remaining audits', updateError)
      }

      setSuccess(true)
      setWebsiteUrl('')
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
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
          We&apos;re analyzing your website. You&apos;ll see results here
          shortly.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Refreshing page in a moment...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="dashboard-websiteUrl"
          className="block text-sm font-medium mb-1"
        >
          Website URL
        </label>
        <div className="flex gap-2">
          <input
            id="dashboard-websiteUrl"
            type="url"
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
            disabled={!canRunAudit || isLoading}
          />
          <button
            type="submit"
            disabled={!canRunAudit || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
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
                Analyzing...
              </span>
            ) : (
              'Analyze Now'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!canRunAudit && !error && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <span>
            You have no audits remaining.{' '}
            <a href="/pricing" className="underline">
              Upgrade your plan
            </a>{' '}
            to run more audits.
          </span>
        </div>
      )}
    </form>
  )
}
