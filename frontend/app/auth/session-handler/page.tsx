'use client'

import SessionHandlerContent from '@/components/SessionHandlerContent'
import { Suspense } from 'react'

export default function SessionHandlerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-xl font-semibold text-center">Loading...</h1>
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        </div>
      }
    >
      <SessionHandlerContent />
    </Suspense>
  )
}
