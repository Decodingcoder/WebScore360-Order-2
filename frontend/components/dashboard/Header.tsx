'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState<{
    email: string | null
    name: string | null
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)

    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser({
          email: session.user?.email || null,
          name: session.user?.user_metadata?.full_name || null,
        })
      }
    }

    getProfile()
  }, [supabase])

  // For first render, don't show the toggle to avoid flickering
  if (!mounted) return null

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {user?.name || user?.email || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
