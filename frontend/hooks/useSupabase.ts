import { createClient } from '@/utils/supabase/client'

/**
 * Custom hook to provide access to the Supabase client
 * This ensures we're using the singleton instance across the app
 */
export function useSupabase() {
  // Since createClient() is now a singleton, this will always return the same instance
  return createClient()
}
