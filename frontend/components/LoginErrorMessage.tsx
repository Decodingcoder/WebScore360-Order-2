'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginErrorMessage() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error message from redirect
    const errorMsg = searchParams.get('error')
    if (errorMsg) {
      setError(errorMsg)
    }
  }, [searchParams])

  if (!error) return null

  return (
    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
      {error}
    </div>
  )
}
