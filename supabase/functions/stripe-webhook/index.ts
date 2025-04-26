// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
// Import Supabase client library and type
import {
  createClient,
  SupabaseClient,
} from 'https://esm.sh/@supabase/supabase-js@2'
// Import Stripe library
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno' // Updated Stripe version, removed explicit deno-std

console.log('Stripe webhook handler function initialized')

// Define Price IDs from your Stripe setup
const PRICE_ID_MAP = {
  // Business+ Plans
  price_1RHy63E1IagRhapR3rDMc10S: 'business_plus', // Yearly
  price_1RHy63E1IagRhapRLmpVQtax: 'business_plus', // Monthly
  // Pro Plans
  price_1RHy68E1IagRhapR6tVjwEXZ: 'pro', // Yearly
  price_1RHy68E1IagRhapRXW3hq88b: 'pro', // Monthly
}

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15', // Match your Stripe API version
  httpClient: Stripe.createFetchHttpClient(), // Use Deno fetch
})

serve(async (req: Request) => {
  console.log('Webhook received a request:', req.method)

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let event
  try {
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set.')
      return new Response('Webhook Error: Configuration error.', {
        status: 500,
      })
    }
    if (!signature) {
      console.error('Missing Stripe-Signature header.')
      return new Response('Missing Stripe-Signature header.', { status: 400 })
    }

    // Verify webhook signature
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider() // Use Deno crypto provider
    )

    console.log(`Received Stripe event: ${event.type}`)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Initialize Supabase Admin Client (do this once after event validation)
  let supabaseAdmin: SupabaseClient // Explicitly type using SupabaseClient type
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(
        'Missing Supabase URL or Service Role Key in environment variables.'
      )
      throw new Error('Supabase configuration missing.')
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      // Optional: Explicitly define auth schema if needed, usually defaults are fine
      // auth: { persistSession: false } // No session persistence needed for admin client
    })
  } catch (initError) {
    console.error('Failed to initialize Supabase admin client:', initError)
    return new Response('Webhook Error: Internal configuration error.', {
      status: 500,
    })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session // Added type assertion

    if (!session.metadata || !session.metadata.user_id) {
      console.error(
        'Error: Missing user_id in checkout session metadata.',
        session.id
      )
      return new Response('Webhook Error: Missing user_id in metadata.', {
        status: 400,
      })
    }
    if (!session.customer) {
      console.error(
        `Error: Missing stripe customer id for session ${session.id}`
      )
      return new Response(
        JSON.stringify({ received: true, error: 'Missing stripe customer id' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (!session.subscription) {
      console.error(`Error: Missing subscription id for session ${session.id}`)
      return new Response(
        JSON.stringify({ received: true, error: 'Missing subscription id' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = session.metadata.user_id
    const stripeCustomerId = session.customer as string
    const stripeSubscriptionId = session.subscription as string // Get subscription ID

    // Retrieve the subscription to get the price ID
    // It's good practice to retrieve it even if session has some details,
    // ensures we have the latest state.
    let subscription: Stripe.Subscription
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    } catch (retrieveError) {
      console.error(
        `Error retrieving subscription ${stripeSubscriptionId} from Stripe:`,
        retrieveError
      )
      return new Response('Webhook Error: Could not retrieve subscription.', {
        status: 500,
      })
    }

    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
      console.error(
        'Error: Could not find Price ID in subscription.',
        subscription.id
      )
      return new Response('Webhook Error: Missing Price ID in subscription.', {
        status: 400,
      })
    }

    const newTier = PRICE_ID_MAP[priceId as keyof typeof PRICE_ID_MAP]

    if (!newTier) {
      console.error(
        `Error: Unrecognized Price ID ${priceId} for subscription ${subscription.id}`
      )
      return new Response(
        JSON.stringify({ received: true, error: 'Unrecognized Price ID' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(
      `Processing checkout for user ${userId}, tier ${newTier}, stripe customer ${stripeCustomerId}, subscription ${stripeSubscriptionId}`
    )

    try {
      let newAuditCount: number | null
      if (newTier === 'pro') newAuditCount = 30
      else if (newTier === 'business_plus') newAuditCount = null
      else newAuditCount = 1 // Should ideally not happen for paid plans

      // Update the user's profile, including the stripe_subscription_id
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: newTier,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId, // STORE THE SUBSCRIPTION ID
          audits_remaining: newAuditCount,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      console.log(
        `Successfully updated profile for user ${userId} to ${newTier} (sub: ${stripeSubscriptionId}).`
      )
    } catch (dbError) {
      console.error(
        `DB error during checkout complete for user ${userId}: ${dbError.message}`
      )
      return new Response(`Webhook Error: Database update failed.`, {
        status: 500,
      })
    }
  }

  // Handle subscription updates
  else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string
    const stripeSubscriptionId = subscription.id
    const priceId = subscription.items.data[0]?.price.id

    // Check for necessary data
    if (!stripeCustomerId) {
      console.error(
        'Webhook Error: Missing customer ID in customer.subscription.updated event.',
        subscription.id
      )
      return new Response('Webhook Error: Missing customer ID.', {
        status: 400,
      })
    }
    if (!priceId) {
      console.error(
        'Webhook Error: Missing price ID in customer.subscription.updated event.',
        subscription.id
      )
      // Might be an update unrelated to price (e.g., metadata), acknowledge successfully.
      return new Response(
        JSON.stringify({
          received: true,
          status: 'Update ignored, no price ID change.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const newTier = PRICE_ID_MAP[priceId as keyof typeof PRICE_ID_MAP]

    if (!newTier) {
      console.error(
        `Error: Unrecognized Price ID ${priceId} in subscription update ${subscription.id}`
      )
      return new Response(
        JSON.stringify({ received: true, error: 'Unrecognized Price ID' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(
      `Processing subscription update for customer ${stripeCustomerId}, sub ${stripeSubscriptionId} to tier ${newTier}`
    )

    try {
      let newAuditCount: number | null
      if (newTier === 'pro') newAuditCount = 30
      else if (newTier === 'business_plus') newAuditCount = null
      else newAuditCount = 1 // Fallback, might indicate free tier change?

      // Update profile based on stripe_customer_id
      // Ensure stripe_subscription_id matches the updated subscription
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: newTier,
          audits_remaining: newAuditCount,
          stripe_subscription_id: stripeSubscriptionId, // Ensure this is up-to-date
        })
        .eq('stripe_customer_id', stripeCustomerId)

      if (updateError) throw updateError

      console.log(
        `Successfully updated profile for customer ${stripeCustomerId} to ${newTier} via subscription update.`
      )
    } catch (dbError) {
      console.error(
        `DB error during subscription update for customer ${stripeCustomerId}: ${dbError.message}`
      )
      return new Response(`Webhook Error: Database update failed.`, {
        status: 500,
      })
    }
  }

  // Handle subscription cancellation
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const stripeCustomerId = subscription.customer as string
    // It's possible the subscription ID being deleted is the one we have stored
    // const deletedStripeSubscriptionId = subscription.id;

    if (!stripeCustomerId) {
      console.error(
        'Webhook Error: Missing customer ID in customer.subscription.deleted event.',
        subscription.id
      )
      return new Response('Webhook Error: Missing customer ID.', {
        status: 400,
      })
    }

    console.log(
      `Processing subscription cancellation for Stripe Customer ID: ${stripeCustomerId}`
    )

    try {
      // Find the user by Stripe Customer ID - Use single() as customer ID should be unique
      const { data: profile, error: findError } = await supabaseAdmin
        .from('profiles')
        .select('id') // Select the user id
        .eq('stripe_customer_id', stripeCustomerId)
        .single() // Expect only one profile per customer ID

      if (findError) {
        // Handle case where profile is not found specifically
        if (findError.code === 'PGRST116') {
          // PostgREST code for no rows found
          console.warn(
            `Webhook Info: Profile not found for stripe_customer_id ${stripeCustomerId} during cancellation. Cannot downgrade.`
          )
          return new Response(
            JSON.stringify({ received: true, status: 'Profile not found' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } else {
          // Other DB error during lookup
          console.error(
            `Webhook Error: Database lookup failed for stripe_customer_id ${stripeCustomerId}. Error: ${findError.message}`
          )
          return new Response(`Webhook Error: Database lookup failed.`, {
            status: 500,
          })
        }
      }

      // Exactly one profile found
      const userId = profile.id
      console.log(`Found user ${userId} for cancellation.`) // Corrected log message

      // Update the user's profile to downgrade to free tier
      // Set stripe_subscription_id to null
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: 'free',
          audits_remaining: 1, // Reset audits to free plan limit
          stripe_subscription_id: null, // Clear the subscription ID
          // Optionally clear stripe_customer_id if you don't want to retain it after cancellation
          // stripe_customer_id: null,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      console.log(
        `Successfully downgraded profile for user ${userId} to free tier.`
      )
    } catch (dbError) {
      console.error(
        `DB error during cancellation for Stripe Customer ${stripeCustomerId}: ${dbError.message}`
      )
      return new Response(
        `Webhook Error: Database update failed during cancellation.`,
        { status: 500 }
      )
    }
  }
  // Handle other event types if needed in the future
  // else if (event.type === 'invoice.paid') { ... }

  // Return a 200 response to acknowledge receipt of the event
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

/* 
TODO List for this function:
- Add handling for payment_failed events?
- Consider edge cases for multiple subscriptions per customer if that becomes possible.
*/
