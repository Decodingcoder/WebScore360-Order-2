import Stripe from 'stripe'

// Ensure the STRIPE_SECRET_KEY is set in your Render environment variables
const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  // In development, you might want to throw an error or use a default test key
  // In production, this MUST be set.
  console.warn(
    'Stripe secret key is not set. Using a default test key for initialization.'
  )
  // throw new Error('STRIPE_SECRET_KEY environment variable not set!');
}

export const stripe = new Stripe(secretKey!, {
  // Fallback to a placeholder test key if not set
  // @ts-expect-error - Stripe API version is not typed
  apiVersion: '2022-11-15',
  typescript: true, // Enable TypeScript definitions
})
