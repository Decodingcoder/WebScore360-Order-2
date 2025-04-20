'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
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

  // Check if the user can run an audit based on remaining count
  const canRunAudit = auditsRemaining > 0 || subscription === 'business_plus'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canRunAudit) {
      setError('You have no audits remaining. Please upgrade your plan.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get user first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('You must be logged in to analyze a website')
      }

      // --- URL Handling: Add schema if missing ---
      let finalWebsiteUrl = websiteUrl.trim()
      if (!finalWebsiteUrl) {
        throw new Error('Please enter a website URL.')
      }
      if (!/^https?:\/\//i.test(finalWebsiteUrl)) {
        finalWebsiteUrl = 'https://' + finalWebsiteUrl
      }

      // Basic validation after adding schema (optional, but good practice)
      try {
        new URL(finalWebsiteUrl) // Check if it forms a valid URL object
      } catch {
        throw new Error('Please enter a valid website URL.')
      }
      // --- End URL Handling ---

      // Create a new audit record with proper user authentication
      const { error: insertError } = await supabase.from('audits').insert({
        user_id: user.id,
        requested_email: user.email,
        website_url: finalWebsiteUrl, // Use the potentially modified URL
        overall_score: null,
        performance_score: null,
        seo_score: null,
        conversion_score: null,
        branding_score: null,
        presence_score: null,
        raw_data: {},
      })

      if (insertError)
        throw new Error('Failed to submit your request: ' + insertError.message)

      // Update the user's audits remaining (skip for business_plus tier)
      if (subscription !== 'business_plus') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            audits_remaining: auditsRemaining - 1,
          })
          .eq('id', user.id)

        if (updateError)
          throw new Error(
            'Failed to update audit count: ' + updateError.message
          )
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
          We&apos;re analyzing your website. Your report will be available in
          the dashboard shortly.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Refreshing page in a moment...
        </p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="dashboard-websiteUrl"
            className="block text-sm font-medium mb-1"
          >
            Website URL
          </label>
          <div className="flex gap-2">
            <Input
              id="dashboard-websiteUrl"
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1"
              required
              disabled={!canRunAudit || isLoading}
            />
            <Button
              type="submit"
              disabled={!canRunAudit || isLoading}
              loading={isLoading}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {!isLoading && 'Analyze Now'}
            </Button>
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
              <Link
                href="/dashboard/upgrade"
                className="underline font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                Upgrade your plan
              </Link>{' '}
              to run more audits.
            </span>
          </div>
        )}
      </form>
    </>
  )
}
