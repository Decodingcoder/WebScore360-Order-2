import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server' // We'll create this helper next
import { getURL } from '@/lib/helpers' // Helper to construct absolute URLs

export async function POST(request: Request) {
  const { priceId } = await request.json()

  if (!priceId) {
    return new NextResponse('Missing priceId', { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Check if user already has a stripe_customer_id in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error(`Error fetching profile for user ${user.id}:`, profileError)
      return new NextResponse('Error fetching user profile', { status: 500 })
    }

    const customerId = profile.stripe_customer_id
    // If no customer ID exists, create one in Stripe (optional, Checkout can create one too)
    // For simplicity, we let Checkout create the customer if needed,
    // using the email and associating it later via webhook.

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer: customerId || undefined, // Use existing customer if available
      customer_email: customerId ? undefined : user.email, // Pass email if creating new customer
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${getURL()}/dashboard?upgraded=true`,
      cancel_url: `${getURL()}/dashboard/upgrade`,
      // We need to pass the user ID to the webhook to update the correct profile
      metadata: {
        user_id: user.id,
      },
      // Allow promotion codes if you have them set up in Stripe
      allow_promotion_codes: true,
    })

    if (!session.id) {
      throw new Error('Could not create Stripe Checkout Session')
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    console.error('Error creating Stripe Checkout session:', err)
    let errorMessage = 'Internal Server Error creating checkout session'
    if (err instanceof Error) {
      errorMessage = err.message
    }
    return new NextResponse(errorMessage, {
      status: 500,
    })
  }
}
