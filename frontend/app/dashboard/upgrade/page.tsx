'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// Function to format plan name
const formatPlanName = (plan: string) => {
  if (plan === 'business_plus') return 'Business+'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

// Added interface for plan details
interface PlanDetails {
  priceId: string
  planName: string
  priceText: string
  isYearly: boolean
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

function UpgradePageContent() {
  const [subscription, setSubscription] = useState<
    'free' | 'pro' | 'business_plus' | null
  >(null)
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<
    string | null
  >(null) // State for subscription ID
  const [auditsRemaining, setAuditsRemaining] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  // Added state for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [planToConfirm, setPlanToConfirm] = useState<PlanDetails | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const stripe = useStripe() // Stripe hook for redirect
  const { toast } = useToast() // Get toast function from the hook

  // Wrap fetchUserData in useCallback to prevent re-creation on every render
  const fetchUserData = useCallback(async () => {
    setIsLoadingData(true)
    // Reset processing state on data fetch
    setIsProcessing(null)
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

  // Function to open the confirmation dialog
  const openConfirmationDialog = (details: PlanDetails) => {
    setPlanToConfirm(details)
    setIsConfirmDialogOpen(true)
  }

  // Renamed function: Handles both initial checkout and subscription updates
  // Now called from the confirmation dialog
  const handlePlanChangeConfirmed = async (newPriceId: string) => {
    setIsConfirmDialogOpen(false) // Close dialog immediately
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
      // Reset processing state regardless of outcome, fetchUserData will do it on success
      // Only reset if it hasn't been reset by fetchUserData already
      if (isProcessing === newPriceId) {
        setIsProcessing(null)
      }
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
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
              {/* Show Pro card if on free OR if on pro */}
              {(subscription === 'free' || subscription === 'pro') && (
                <Card className="flex flex-col justify-between h-full">
                  <CardHeader>
                    <CardTitle>Pro Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>30 audits per month</li>
                      <li>Unlock all Fix-It Guidance details</li>
                    </ul>
                    <div className="space-y-2">
                      {/* Monthly Pro */}
                      <Button
                        onClick={() =>
                          openConfirmationDialog({
                            priceId: PRICE_IDS.pro.monthly,
                            planName: 'Pro',
                            priceText: '$9/month',
                            isYearly: false,
                          })
                        }
                        disabled={
                          isProcessing !== null || subscription === 'pro' // Disable if processing OR already on Pro
                        }
                        className="w-full"
                      >
                        {isProcessing === PRICE_IDS.pro.monthly
                          ? 'Processing...'
                          : subscription === 'pro' // Show current plan if on Pro
                          ? 'Current Plan'
                          : '$9/month'}
                      </Button>
                      {/* Yearly Pro */}
                      <Button
                        onClick={() =>
                          openConfirmationDialog({
                            priceId: PRICE_IDS.pro.yearly,
                            planName: 'Pro (Annual)',
                            priceText: 'Billed Annually (Save 25%)',
                            isYearly: true,
                          })
                        }
                        disabled={
                          isProcessing !== null || subscription === 'pro' // Disable if processing OR already on Pro
                        }
                        className="w-full"
                        variant="outline"
                      >
                        {isProcessing === PRICE_IDS.pro.yearly
                          ? 'Processing...'
                          : subscription === 'pro' // Show current plan if on Pro
                          ? 'Current Plan'
                          : 'Pay Annually & Save 25%'}
                      </Button>
                    </div>
                  </CardContent>
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
                    <li>All Pro features included</li>
                    <li>Unlimited audits per month</li>
                    {/* Placeholder features from specs */}
                    <li>Priority Support (Placeholder)</li>
                    <li>Competitor Benchmarks (Placeholder)</li>
                  </ul>
                  <div className="space-y-2">
                    {/* Monthly Business+ */}
                    <Button
                      onClick={() =>
                        openConfirmationDialog({
                          priceId: PRICE_IDS.business_plus.monthly,
                          planName: 'Business+',
                          priceText: '$38/month',
                          isYearly: false,
                        })
                      }
                      disabled={isProcessing !== null} // Only disable if processing
                      className="w-full"
                    >
                      {isProcessing === PRICE_IDS.business_plus.monthly
                        ? 'Processing...'
                        : '$38/month'}
                    </Button>
                    {/* Yearly Business+ */}
                    <Button
                      onClick={() =>
                        openConfirmationDialog({
                          priceId: PRICE_IDS.business_plus.yearly,
                          planName: 'Business+ (Annual)',
                          priceText: 'Billed Annually (Save 25%)',
                          isYearly: true,
                        })
                      }
                      disabled={isProcessing !== null} // Only disable if processing
                      className="w-full"
                      variant="outline"
                    >
                      {isProcessing === PRICE_IDS.business_plus.yearly
                        ? 'Processing...'
                        : 'Pay Annually & Save 25%'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation Dialog (using standard Dialog) */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              {planToConfirm &&
                `Are you sure you want to ${
                  stripeSubscriptionId ? 'change to' : 'subscribe to'
                } the ${planToConfirm.planName} plan for ${
                  planToConfirm.priceText
                }?`}
              {planToConfirm?.isYearly && ' You will be billed annually.'}
              {!stripeSubscriptionId &&
                ' You will be redirected to Stripe to complete your payment.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* Use standard Buttons for Cancel/Confirm */}
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isProcessing !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                planToConfirm &&
                handlePlanChangeConfirmed(planToConfirm.priceId)
              }
              disabled={isProcessing !== null}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
