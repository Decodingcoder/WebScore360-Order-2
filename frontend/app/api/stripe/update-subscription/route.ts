import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe' // Import only the type
import { stripe } from '@/lib/stripe/server' // Import shared instance

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      console.error('User not authenticated:', userError?.message)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = userData.user.id

    const { newPriceId } = await req.json()
    if (!newPriceId || typeof newPriceId !== 'string') {
      return NextResponse.json({ error: 'Missing newPriceId' }, { status: 400 })
    }

    // Fetch user's profile to get current subscription ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id') // Select required fields
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error(`Error fetching profile for user ${userId}:`, profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile?.stripe_subscription_id) {
      console.error(
        `User ${userId} does not have an active subscription ID to update.`
      )
      // This condition should ideally be caught by the frontend,
      // but handle it here as a fallback. Could redirect to checkout instead?
      // For now, return an error indicating the state mismatch.
      return NextResponse.json(
        { error: 'No active subscription found to update.' },
        { status: 400 }
      )
    }

    const currentSubscriptionId = profile.stripe_subscription_id

    // Retrieve the current subscription from Stripe to get the item ID
    let subscription: Stripe.Subscription // Keep Stripe type needed here
    try {
      subscription = await stripe.subscriptions.retrieve(currentSubscriptionId)
    } catch (stripeError) {
      console.error(
        `Error retrieving subscription ${currentSubscriptionId} from Stripe:`,
        stripeError
      )
      return NextResponse.json(
        { error: 'Failed to retrieve current subscription from Stripe.' },
        { status: 500 }
      )
    }

    // Assume there's only one subscription item to update
    const subscriptionItemId = subscription.items.data[0]?.id

    if (!subscriptionItemId) {
      console.error(
        `No items found on subscription ${currentSubscriptionId} for user ${userId}.`
      )
      return NextResponse.json(
        { error: 'Subscription has no items to update.' },
        { status: 500 }
      )
    }

    // Update the subscription item with the new price
    try {
      await stripe.subscriptions.update(currentSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId, // The new price ID selected by the user
          },
        ],
        proration_behavior: 'create_prorations', // Calculate prorations
        cancel_at_period_end: false, // Ensure the subscription remains active
      })

      console.log(
        `Successfully updated subscription ${currentSubscriptionId} for user ${userId} to price ${newPriceId}.`
      )
      // The webhook customer.subscription.updated will handle DB updates.
      return NextResponse.json({ success: true })
    } catch (updateError) {
      console.error(
        `Error updating subscription ${currentSubscriptionId} for user ${userId}:`,
        updateError
      )
      return NextResponse.json(
        { error: 'Failed to update subscription in Stripe.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in update-subscription API:', error)
    // Check if error is an instance of Error to safely access message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
