import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { SupabaseClientOptions } from '@supabase/supabase-js'

// Define a simple localStorage adapter compatible with Supabase options
const localStorageAdapter = {
  getItem: (key: string): string | Promise<string | null> | null => {
    if (typeof window === 'undefined') {
      return null // Return null on server-side
    }
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string): void | Promise<void> => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  },
}

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

  const options: SupabaseClientOptions<'public'> = {
    auth: {
      // Persist session across browser tabs/reloads
      persistSession: true,
      // Use localStorage for session persistence
      storage: localStorageAdapter,
      // Implicit flow doesn't need URL detection for code
      detectSessionInUrl: false,
      // Use standard storage key (already set, but good to keep)
      storageKey: 'sb-auth-token',
      // Auto refresh token (important for long sessions)
      autoRefreshToken: true,
    },
  }

  supabaseInstance = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    options
  )
  return supabaseInstance
}
