'use client'

import AnalyzeForm from '@/components/dashboard/AnalyzeForm'
import AuditsList from '@/components/dashboard/AuditsList'
import ScoreCard from '@/components/dashboard/ScoreCard'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface Audit {
  id: string
  user_id: string | null
  requested_email: string
  website_url: string
  created_at: string
  overall_score: number
  performance_score: number
  seo_score: number
  conversion_score: number
  branding_score: number
  presence_score: number
  report_pdf_url: string | null
  raw_data: Record<string, unknown>
}

export default function Dashboard() {
  const [subscription, setSubscription] = useState<
    'free' | 'pro' | 'business_plus'
  >('free')
  const [auditsRemaining, setAuditsRemaining] = useState(0)
  const [latestAudit, setLatestAudit] = useState<Audit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) return

        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (profile) {
          setSubscription(profile.subscription_tier)
          setAuditsRemaining(profile.audits_remaining)
        }

        // Get latest audit
        const { data: audits } = await supabase
          .from('audits')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (audits && audits.length > 0) {
          setLatestAudit(audits[0] as Audit)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Helper function to render traffic light color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Your Plan:{' '}
              <span className="capitalize">
                {subscription.replace('_', ' ')}
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {auditsRemaining}{' '}
              {subscription === 'business_plus'
                ? 'unlimited'
                : `of ${subscription === 'pro' ? '30' : '1'}`}{' '}
              audits remaining this month
            </p>
          </div>
          <a
            href="/pricing"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </a>
        </div>
      </div>

      {/* Scores Section - Show only if has an audit */}
      {latestAudit && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Latest Audit Results</h2>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getScoreColor(
                  latestAudit.overall_score
                )}`}
              >
                {Math.round(latestAudit.overall_score)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {latestAudit.website_url}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analyzed on{' '}
                  {new Date(latestAudit.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <ScoreCard
                title="Performance"
                score={latestAudit.performance_score}
                description="Page speed and technical aspects"
              />
              <ScoreCard
                title="SEO"
                score={latestAudit.seo_score}
                description="Search engine optimization"
              />
              <ScoreCard
                title="Conversion"
                score={latestAudit.conversion_score}
                description="Lead generation potential"
              />
              <ScoreCard
                title="Branding"
                score={latestAudit.branding_score}
                description="Brand presentation and identity"
              />
              <ScoreCard
                title="Presence"
                score={latestAudit.presence_score}
                description="Online presence and social media"
              />
            </div>
          </div>
        </div>
      )}

      {/* New Analysis Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Analyze a Website</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <AnalyzeForm
            auditsRemaining={auditsRemaining}
            subscription={subscription}
          />
        </div>
      </div>

      {/* Recent Audits */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Audits</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <AuditsList />
        </div>
      </div>
    </div>
  )
}
