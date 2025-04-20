'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
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
