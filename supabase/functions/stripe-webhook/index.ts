// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// Import Supabase client library
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Import Stripe library
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&deno-std=0.132.0' // Use deno compatible version

console.log('Stripe webhook handler function initialized')

// Define Price IDs from your Stripe setup
const PRICE_ID_MAP = {
  // Business+ Plans
  price_1RFv8nE1IagRhapRE1argYKQ: 'business_plus', // Yearly
  price_1RFv8nE1IagRhapRHu52AqJJ: 'business_plus', // Monthly
  // Pro Plans
  price_1RFv9WE1IagRhapRqmnSHDbe: 'pro', // Yearly
  price_1RFv78E1IagRhapRcD1Q0VEH: 'pro', // Monthly
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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object // Type assertion if needed, or use as any

    // Check if metadata and user_id exist
    if (!session.metadata || !session.metadata.user_id) {
      console.error(
        'Error: Missing user_id in checkout session metadata.',
        session.id
      )
      return new Response('Webhook Error: Missing user_id in metadata.', {
        status: 400,
      })
    }

    const userId = session.metadata.user_id
    const stripeCustomerId = session.customer
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
      console.error(
        'Error: Could not find Price ID in subscription.',
        session.id
      )
      return new Response('Webhook Error: Missing Price ID.', { status: 400 })
    }

    // Assert priceId is a key of PRICE_ID_MAP before lookup
    const newTier = PRICE_ID_MAP[priceId as keyof typeof PRICE_ID_MAP]

    if (!newTier) {
      console.error(
        `Error: Unrecognized Price ID ${priceId} for session ${session.id}`
      )
      // Still acknowledge the webhook, but log the error
      return new Response(
        JSON.stringify({ received: true, error: 'Unrecognized Price ID' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!stripeCustomerId) {
      console.error(
        `Error: Missing stripe customer id for session ${session.id}`
      )
      // Still acknowledge the webhook, but log the error
      return new Response(
        JSON.stringify({ received: true, error: 'Missing stripe customer id' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(
      `Processing checkout for user ${userId}, tier ${newTier}, stripe customer ${stripeCustomerId}`
    )

    try {
      // Initialize Supabase client with elevated privileges
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Determine the correct audit count for the new tier
      let newAuditCount: number | null
      if (newTier === 'pro') {
        newAuditCount = 30 // Pro plan gets 30 audits
      } else if (newTier === 'business_plus') {
        newAuditCount = null // Represent unlimited with null (or a very high number)
      } else {
        newAuditCount = 1 // Default to free plan limit if needed
      }

      // Update the user's profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: newTier,
          stripe_customer_id: stripeCustomerId,
          audits_remaining: newAuditCount, // Set the audit count
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      console.log(
        `Successfully updated profile for user ${userId} to ${newTier} with ${
          newAuditCount === null ? 'unlimited' : newAuditCount
        } audits.`
      )
    } catch (dbError) {
      console.error(
        `Database error updating profile for user ${userId}: ${dbError.message}`
      )
      // Return 500 so Stripe retries the webhook
      return new Response(`Webhook Error: Database update failed.`, {
        status: 500,
      })
    }
  }
  // Handle subscription cancellation
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription // Cast to Stripe Subscription type
    const stripeCustomerId = subscription.customer as string

    if (!stripeCustomerId) {
      console.error(
        'Webhook Error: Missing customer ID in customer.subscription.deleted event.',
        subscription.id
      )
      // Don't return 500, as the event data is incomplete
      return new Response('Webhook Error: Missing customer ID.', {
        status: 400,
      })
    }

    console.log(
      `Processing subscription cancellation for Stripe Customer ID: ${stripeCustomerId}`
    )

    try {
      // Initialize Supabase client with elevated privileges
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Find the user by Stripe Customer ID
      const { data: profile, error: findError } = await supabaseAdmin
        .from('profiles')
        .select('id') // Select the user id
        .eq('stripe_customer_id', stripeCustomerId)
        .single() // Expecting only one user per customer ID

      if (findError) {
        // If user not found, it might be an old customer or data mismatch, log but acknowledge
        console.error(
          `Webhook Info: Profile not found for stripe_customer_id ${stripeCustomerId}. Error: ${findError.message}`
        )
        return new Response(
          JSON.stringify({ received: true, status: 'Profile not found' }),
          {
            status: 200, // Acknowledge webhook even if profile not found
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (profile) {
        const userId = profile.id
        console.log(`Found user ${userId} for cancellation.`)

        // Update the user's profile to downgrade to free tier
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: 'free',
            audits_remaining: 1, // Reset audits to free plan limit
            // Optionally clear stripe_customer_id or set an end date
            // stripe_customer_id: null,
          })
          .eq('id', userId)

        if (updateError) {
          throw updateError // Let the outer catch handle DB errors for retry
        }

        console.log(
          `Successfully downgraded profile for user ${userId} to free tier.`
        )
      } else {
        // This case should ideally be covered by findError check with .single()
        console.warn(
          `Webhook Warning: Profile lookup returned null unexpectedly for stripe_customer_id ${stripeCustomerId}`
        )
      }
    } catch (dbError) {
      console.error(
        `Database error during cancellation for Stripe Customer ${stripeCustomerId}: ${dbError.message}`
      )
      // Return 500 so Stripe retries the webhook
      return new Response(
        `Webhook Error: Database update failed during cancellation.`,
        {
          status: 500,
        }
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
- Consider adding handling for subscription updates later.
*/
