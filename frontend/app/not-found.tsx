'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          We couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link href="/" passHref>
          <Button className="w-full">Return to Homepage</Button>
        </Link>
      </div>
    </div>
  )
}
