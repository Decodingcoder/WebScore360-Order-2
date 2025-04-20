'use client' // Error components must be Client Components

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react' // Using an icon for visual cue
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  // Renamed component to Error
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      {' '}
      {/* Center vertically */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-3 bg-destructive/10">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div className="flex flex-col">
            <CardTitle className="text-destructive">
              Something Went Wrong
            </CardTitle>
            <CardDescription>An unexpected error occurred.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            We encountered an issue. Please try again. If the problem persists,
            feel free to contact support.
          </p>
          {/* Optionally display simple error message in development */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <details className="mt-4 p-3 bg-secondary rounded">
              <summary className="text-xs font-medium cursor-pointer">
                Error Details (Dev Only)
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ''}
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
