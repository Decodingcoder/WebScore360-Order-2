// frontend/app/api/stripe/create-checkout-session/route.ts

import { NextResponse } from 'next/server'

// Temporarily bypass Stripe logic so build won’t fail:
export async function POST(request: Request) {
  return NextResponse.json({ message: 'Stripe route disabled for staging.' })
}
