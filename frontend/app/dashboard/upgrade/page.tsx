'use client'

import UpgradeModal from '@/components/UpgradeModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Function to format plan name
const formatPlanName = (plan: string) => {
  if (plan === 'business_plus') return 'Business+'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

export default function UpgradePage() {
  const [subscription, setSubscription] = useState<
    'free' | 'pro' | 'business_plus' | null
  >(null)
  const [auditsRemaining, setAuditsRemaining] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Business+'>('Pro')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()
        if (userError || !userData?.user) {
          console.error('Error fetching user or user not logged in:', userError)
          router.push('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, audits_remaining')
          .eq('id', userData.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else if (profile) {
          setSubscription(profile.subscription_tier)
          setAuditsRemaining(profile.audits_remaining)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [supabase, router])

  const openUpgradeModal = (plan: 'Pro' | 'Business+') => {
    setSelectedPlan(plan)
    setUpgradeModalOpen(true)
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

  const currentPlanName = subscription
    ? formatPlanName(subscription)
    : 'Loading...'
  const auditsText =
    subscription === 'business_plus'
      ? 'Unlimited audits'
      : auditsRemaining !== null
      ? `${auditsRemaining} audits remaining this month`
      : ''

  return (
    <div className="space-y-6">
      {/* Current Plan Section */}
      <h2 className="text-xl font-bold">Current Plan</h2>
      <Card>
        <CardContent className="space-y-2 pt-6">
          <p className="text-lg font-semibold">
            You are currently on the{' '}
            <span
              className={
                subscription === 'business_plus'
                  ? 'text-purple-600 dark:text-purple-400'
                  : subscription === 'pro'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              {currentPlanName}
            </span>{' '}
            plan.
          </p>
          {auditsText && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {auditsText}
            </p>
          )}
        </CardContent>
      </Card>

      {subscription !== 'business_plus' && (
        <>
          {/* Upgrade Plan Section */}
          <h2 className="text-xl font-bold">Upgrade Your Plan</h2>
          <Card>
            <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
              {subscription === 'free' && (
                <Card className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>Pro Plan</CardTitle>
                    <p className="text-sm text-gray-500">$9/month</p>
                    <p className="text-xs text-gray-400">
                      or $81/year (save 25%)
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>30 audits per month</li>
                      <li>Comprehensive fix-it guidance</li>
                      <li>Priority email support</li>
                    </ul>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => openUpgradeModal('Pro')}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Business+ Plan</CardTitle>
                  <p className="text-sm text-gray-500">$38/month</p>
                  <p className="text-xs text-gray-400">
                    or $342/year (save 25%)
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Unlimited audits</li>
                    <li>All Pro features included</li>
                    <li>Competitor benchmarking (placeholder)</li>
                    <li>Priority support & consultations (placeholder)</li>
                  </ul>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => openUpgradeModal('Business+')}
                  >
                    Upgrade to Business+
                  </Button>
                </div>
              </Card>
            </CardContent>
          </Card>
        </>
      )}

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        planName={selectedPlan}
      />
    </div>
  )
}
