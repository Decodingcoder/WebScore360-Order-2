'use client'

import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Handle client-side hydration safely
  useEffect(() => {
    setMounted(true)

    const getUserData = async () => {
      setIsLoading(true)
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser()
      setUser(fetchedUser)
      setIsLoading(false)
    }
    getUserData()
  }, [supabase])

  // During server-side rendering or static generation, show a placeholder
  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  // For client-side rendering, show loading state
  if (isLoading || !mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  // Extract user's name from user metadata or use email
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : '?'

  // Handle case where user is null after loading (e.g., logged out)
  if (!user) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/* Optionally add a login button or different UI */}
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {firstLetter}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{displayName || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
