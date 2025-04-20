'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<
    string | null
  >(null) // State for subscription ID
  const [auditsRemaining, setAuditsRemaining] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null) // Renamed from isRedirecting, handles both checkout and update
  const supabase = createClient()
  const router = useRouter()
  const stripe = useStripe() // Stripe hook for redirect
  const { toast } = useToast() // Get toast function from the hook

  // Wrap fetchUserData in useCallback to prevent re-creation on every render
  const fetchUserData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
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
        // Fetch stripe_subscription_id as well
        .select('subscription_tier, audits_remaining, stripe_subscription_id')
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
        setStripeSubscriptionId(profile.stripe_subscription_id) // Store subscription ID
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
  }, [supabase, router, toast]) // Dependencies for useCallback

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData]) // Run fetchUserData when the component mounts or fetchUserData changes

  // Renamed function: Handles both initial checkout and subscription updates
  const handlePlanChange = async (newPriceId: string) => {
    setIsProcessing(newPriceId) // Indicate processing started for this priceId

    try {
      // If user has an existing subscription ID, update it
      if (stripeSubscriptionId) {
        const response = await fetch('/api/stripe/update-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPriceId }), // Send the new price ID
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error ||
              'Failed to update subscription. Please try again.'
          )
        }

        // Success!
        toast({
          title: 'Subscription Updated',
          description: 'Your plan has been successfully updated.',
        })
        // Refresh user data to show the new plan details
        await fetchUserData()
      } else {
        // No existing subscription ID, proceed with creating a checkout session
        if (!stripe) {
          console.error('Stripe.js has not loaded yet.')
          throw new Error(
            'Payment system is not ready. Please try again shortly.'
          )
        }
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId: newPriceId }), // Use priceId here
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
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        })
        if (stripeError) {
          throw stripeError // Let the catch block handle Stripe errors
        }
        // Redirect happens here, code below this won't execute on success
      }
    } catch (error: unknown) {
      console.error('Plan change error:', error)
      let errorMessage = 'An unexpected error occurred. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast({
        variant: 'destructive',
        title: 'Plan Change Failed',
        description: errorMessage,
      })
    } finally {
      setIsProcessing(null) // Clear processing state
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

      {/* Upgrade Plan Section - Renders if not on highest tier */}
      {subscription !== 'business_plus' && (
        <>
          <h2 className="text-xl font-bold">
            {stripeSubscriptionId ? 'Change Your Plan' : 'Choose Your Plan'}
          </h2>
          <Card>
            <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
              {/* Pro Plan Card */}
              {/* Show Pro card if on free OR if on pro (to allow switching billing cycle) */}
              {(subscription === 'free' || subscription === 'pro') && (
                <Card className="flex flex-col justify-between h-full">
                  <CardHeader>
                    <CardTitle>Pro Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>30 audits per month</li>
                      <li>Comprehensive fix-it guidance</li>
                      <li>Priority email support</li>
                    </ul>
                  </CardContent>
                  <div className="space-y-2 p-6 pt-0 mt-auto">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      // Call handlePlanChange with the correct price ID
                      onClick={() => handlePlanChange(PRICE_IDS.pro.monthly)}
                      // Use isProcessing state
                      disabled={isProcessing !== null}
                    >
                      {/* Check if this specific button is processing */}
                      {isProcessing === PRICE_IDS.pro.monthly
                        ? 'Processing...'
                        : '$9 / month'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handlePlanChange(PRICE_IDS.pro.yearly)}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === PRICE_IDS.pro.yearly
                        ? 'Processing...'
                        : '$81 / year (Save 25%)'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Business+ Plan Card */}
              {/* Always show Business+ card if not already on it */}
              <Card className="flex flex-col justify-between h-full">
                <CardHeader>
                  <CardTitle>Business+ Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Unlimited audits</li>
                    <li>Advanced AI analysis features</li>
                    <li>Dedicated account manager</li>
                    <li>API Access (coming soon)</li>
                  </ul>
                </CardContent>
                <div className="space-y-2 p-6 pt-0 mt-auto">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() =>
                      handlePlanChange(PRICE_IDS.business_plus.monthly)
                    }
                    disabled={isProcessing !== null}
                  >
                    {isProcessing === PRICE_IDS.business_plus.monthly
                      ? 'Processing...'
                      : '$49 / month'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handlePlanChange(PRICE_IDS.business_plus.yearly)
                    }
                    disabled={isProcessing !== null}
                  >
                    {isProcessing === PRICE_IDS.business_plus.yearly
                      ? 'Processing...'
                      : '$468 / year (Save 25%)'}
                  </Button>
                </div>
              </Card>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// Main page component that wraps content with Stripe Elements provider
export default function UpgradePage() {
  return (
    <Elements stripe={stripePromise}>
      <UpgradePageContent />
    </Elements>
  )
}
