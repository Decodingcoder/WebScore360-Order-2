// frontend/app/api/stripe/create-checkout-session/route.ts

import { NextResponse } from 'next/server'

// This dummy handler prevents build-time errors by avoiding any Stripe calls.
export async function POST(request: Request) {
  // Return a simple JSON payload instead of invoking Stripe.
  return NextResponse.json({ message: 'Stripe is temporarily disabled for staging.' })
}
