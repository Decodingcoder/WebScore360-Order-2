'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast' // Changed import path for shadcn toast hook
import { createClient } from '@/utils/supabase/client'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Function to format plan name
const formatPlanName = (plan: string) => {
  if (plan === 'business_plus') return 'Business+'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

// Price IDs from your Stripe setup - Replace with your actual IDs if different
const PRICE_IDS = {
  pro: {
    monthly: 'price_1RFv78E1IagRhapRcD1Q0VEH',
    yearly: 'price_1RFv9WE1IagRhapRqmnSHDbe',
  },
  business_plus: {
    monthly: 'price_1RFv8nE1IagRhapRHu52AqJJ',
    yearly: 'price_1RFv8nE1IagRhapRE1argYKQ',
  },
}

// Initialize Stripe outside of the component render cycle
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

// New component to handle Stripe interactions within Elements provider
function UpgradePageContent() {
  const [subscription, setSubscription] = useState<
    'free' | 'pro' | 'business_plus' | null
  >(null)
  const [auditsRemaining, setAuditsRemaining] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null) // Store the priceId being processed
  const supabase = createClient()
  const router = useRouter()
  const stripe = useStripe() // Stripe hook
  const { toast } = useToast() // Get toast function from the hook

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingData(true)
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()
        if (userError || !userData?.user) {
          console.error('Error fetching user or user not logged in:', userError)
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Please log in to manage your subscription.',
          })
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
          toast({
            variant: 'destructive',
            title: 'Error Loading Profile',
            description: 'Could not load your profile data.',
          })
        } else if (profile) {
          setSubscription(profile.subscription_tier)
          setAuditsRemaining(profile.audits_remaining)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          variant: 'destructive',
          title: 'Unexpected Error',
          description: 'An error occurred while loading your data.',
        })
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchUserData()
  }, [supabase, router, toast]) // Added toast to dependency array

  // Handle redirect to Stripe Checkout
  const handleCheckout = async (priceId: string) => {
    if (!stripe) {
      console.error('Stripe.js has not loaded yet.')
      toast({
        variant: 'destructive',
        title: 'Payment System Error',
        description: 'Payment system is not ready. Please try again shortly.',
      })
      return
    }

    setIsRedirecting(priceId)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to create checkout session: ${response.status} ${errorText}`
        )
      }

      const { sessionId } = await response.json()

      if (!sessionId) {
        throw new Error('Received invalid session ID from server.')
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe redirect error:', error)
        toast({
          variant: 'destructive',
          title: 'Payment Redirect Error',
          description: `Payment Error: ${error.message}`,
        })
      }
      // If redirect is successful, the user won't reach here.
    } catch (error: unknown) {
      // Changed any to unknown
      console.error('Checkout error:', error)
      let errorMessage = 'An error occurred during checkout. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: errorMessage,
      })
    } finally {
      setIsRedirecting(null) // Clear loading state regardless of outcome
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Simple Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
              {/* Pro Plan Card - Conditionally rendered based on current plan */}
              {subscription === 'free' && (
                <Card className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>Pro Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>30 audits per month</li>
                      <li>Comprehensive fix-it guidance</li>
                      <li>Priority email support</li>
                    </ul>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleCheckout(PRICE_IDS.pro.monthly)}
                        disabled={isRedirecting !== null}
                      >
                        {isRedirecting === PRICE_IDS.pro.monthly
                          ? 'Processing...'
                          : '$9 / month'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCheckout(PRICE_IDS.pro.yearly)}
                        disabled={isRedirecting !== null}
                      >
                        {isRedirecting === PRICE_IDS.pro.yearly
                          ? 'Processing...'
                          : '$81 / year (Save 25%)'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Business+ Plan Card */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Business+ Plan</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Unlimited audits</li>
                    <li>All Pro features included</li>
                    <li>Competitor benchmarking (future)</li>
                    <li>Priority support (future)</li>
                  </ul>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() =>
                        handleCheckout(PRICE_IDS.business_plus.monthly)
                      }
                      disabled={isRedirecting !== null}
                    >
                      {isRedirecting === PRICE_IDS.business_plus.monthly
                        ? 'Processing...'
                        : '$38 / month'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        handleCheckout(PRICE_IDS.business_plus.yearly)
                      }
                      disabled={isRedirecting !== null}
                    >
                      {isRedirecting === PRICE_IDS.business_plus.yearly
                        ? 'Processing...'
                        : '$342 / year (Save 25%)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// Main export wrapping content with Elements provider
export default function UpgradePage() {
  const options = {
    // If using multiple Stripe accounts or specific options
    // clientSecret: '...', // Example option if needed
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <UpgradePageContent />
    </Elements>
  )
}
