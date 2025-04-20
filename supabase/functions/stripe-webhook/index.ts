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

      // Update the user's profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: newTier,
          stripe_customer_id: stripeCustomerId,
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      console.log(
        `Successfully updated profile for user ${userId} to ${newTier}`
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
- [X] Import Stripe Deno library.
- [X] Initialize Supabase client.
- [X] Get STRIPE_WEBHOOK_SECRET from env.
- [X] Verify Stripe signature.
- [X] Handle event type `checkout.session.completed`.
- [X] Extract user_id from metadata and stripe_customer_id.
- [X] Extract purchased price ID to determine new tier.
- [X] Update the user's profile in Supabase DB.
- [X] Add error handling for DB updates.
- Consider adding handling for subscription cancellations/updates later.
*/
