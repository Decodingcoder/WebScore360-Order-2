import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server' // We'll create this helper next
import { getURL } from '@/lib/helpers' // Helper to construct absolute URLs
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'




// ── Add these env-var bindings ───────────────────────────────────────────
const supabaseUrl       = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const stripeSecretKey   = process.env.STRIPE_SECRET_KEY!


export async function POST(request: Request) {
  const { priceId } = await request.json()
if (!priceId) {
  console.error('Missing priceId in request body')
  return new NextResponse('Missing priceId', { status: 400 })
}
  // …
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    { cookies: await cookies() }
  )


  console.log('API Route: Attempting to get user...') // Log before getUser
  const {
    data: { user },
    error: getUserError, // Capture potential error from getUser
  } = await supabase.auth.getUser()

  if (getUserError) {
    console.error(
      'API Route Error: supabase.auth.getUser() failed:',
      getUserError
    )
    return new NextResponse('Internal Server Error getting user', {
      status: 500,
    })
  }

  if (!user) {
    console.error(
      'API Route Error: User is not authenticated (user object is null).'
    ) // Log specific reason for 401
    return new NextResponse('Unauthorized', { status: 401 })
  }

  console.log(`API Route: User authenticated: ${user.id}`) // Log successful auth

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

    console.log('💥 create-checkout-session route hit')
    const body = await request.json()
    console.log('POST Body:', body)
const priceId = body.priceId

if (!priceId) {
  console.error('Missing priceId in request body')
  return new NextResponse('Missing priceId', { status: 400 })
}

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
}  // <— Add this closing brace to end the POST function