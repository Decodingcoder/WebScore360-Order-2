-- Add stripe_subscription_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN stripe_subscription_id TEXT;

-- Optional: Add a comment to the column for clarity
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stores the active Stripe Subscription ID for the user.'; 