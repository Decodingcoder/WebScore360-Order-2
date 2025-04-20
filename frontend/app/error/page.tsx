// No longer a client component for static display

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// Simplified component signature, no props needed
export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-3 bg-destructive/10">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div className="flex flex-col">
            {/* Generic Title */}
            <CardTitle className="text-destructive">
              An Error Occurred
            </CardTitle>
            {/* Generic Description */}
            <CardDescription>Something went wrong.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Static Message */}
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected issue. Please try navigating back home
            or contact support if the problem continues.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          {/* Only Go Home button */}
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
