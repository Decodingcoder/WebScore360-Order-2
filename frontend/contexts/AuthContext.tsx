'use client'

import { useSupabase } from '@/hooks/useSupabase'
import { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null
  }>
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null
  }>
  refreshSession: () => Promise<void>
}

// Create default values that are safe for SSG
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true, // Changed to true to prevent flash of unauthenticated content
  signOut: async () => {}, // No-op function for SSG
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  refreshSession: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitializedAuth, setHasInitializedAuth] = useState(false)
  const supabase = useSupabase()

  // Function to refresh session - can be called manually when needed
  const refreshSession = useCallback(async () => {
    try {
      console.log('Manually refreshing session')
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      if (data.session) {
        console.log('Session refreshed successfully')
        setSession(data.session)
        setUser(data.session.user)
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
    }
  }, [supabase])

  // This effect fetches the initial session once on mount
  useEffect(() => {
    let mounted = true

    // Add session detection to the window focus event for better refresh handling
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession()
          if (mounted && currentSession) {
            console.log('Visibility changed, updating session')
            setSession(currentSession)
            setUser(currentSession.user)
          } else if (mounted) {
            // No current session, try to refresh it
            refreshSession()
          }
        } catch (error) {
          console.error('Error refreshing session on visibility change:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const handleStorage = async (event: StorageEvent) => {
      // Listen for changes to auth-related localStorage items
      if (event.key?.includes('auth')) {
        console.log('Auth storage changed, refreshing session')
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (mounted && session) {
          setSession(session)
          setUser(session.user)
        }
      }
    }

    window.addEventListener('storage', handleStorage)

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth')
        setIsLoading(true)

        // Try to get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted) {
          if (session) {
            console.log('Initial session found')
            setSession(session)
            setUser(session.user)
          } else {
            console.log('No initial session found')
            // Try to recover session
            await refreshSession()
          }
          setHasInitializedAuth(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setHasInitializedAuth(true)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [supabase, refreshSession])

  // This effect sets up the auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        'Auth state changed:',
        event,
        session ? 'Session exists' : 'No session'
      )

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session)
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      // Explicitly clear the state after sign out
      setSession(null)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return { error }
      } catch (error) {
        console.error('Error signing in with email:', error)
        return {
          error:
            error instanceof Error
              ? error
              : new Error('Unknown error during sign in'),
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        return { error }
      } catch (error) {
        console.error('Error signing up with email:', error)
        return {
          error:
            error instanceof Error
              ? error
              : new Error('Unknown error during sign up'),
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  const value = {
    user,
    session,
    isLoading: isLoading || !hasInitializedAuth,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Safe hook that works during both client-side rendering and SSG
export function useAuth() {
  return useContext(AuthContext)
}
