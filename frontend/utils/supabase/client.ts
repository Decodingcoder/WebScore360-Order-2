import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null =
  null

export const createClient = () => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create a new instance if none exists
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  supabaseInstance = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
  return supabaseInstance
}
