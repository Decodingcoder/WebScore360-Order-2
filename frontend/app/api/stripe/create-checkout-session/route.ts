// frontend/app/api/stripe/update-subscription/route.ts

import { NextResponse } from 'next/server'

// Temporarily bypass Stripe for update-subscription so build succeeds
export async function POST(request: Request) {
  return NextResponse.json({ message: 'Update‐subscription disabled for staging.' })
}
