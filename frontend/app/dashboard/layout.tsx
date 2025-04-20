'use client'

import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import { createClient } from '@/utils/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for authenticated layouts
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const {
        data: { session: fetchedSession },
        error: sessionError,
      } = await supabase.auth.getSession()
      const {
        data: { user: fetchedUser },
        error: userError,
      } = await supabase.auth.getUser()

      setSession(fetchedSession)
      setUser(fetchedUser)

      if (!fetchedSession || !fetchedUser || sessionError || userError) {
        console.log(
          'Auth check failed or user not found, redirecting to login',
          { sessionError, userError }
        )
        router.push('/login')
      }
      setIsLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (!newSession) {
        router.push('/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
