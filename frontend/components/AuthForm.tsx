'use client'

import { login, signup } from '@/app/login/actions'
import OneTapComponent from '@/components/auth/OneTapComponent'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

type AuthMode = 'signin' | 'signup' | 'verification'

export default function AuthForm() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      if (mode === 'signin') {
        await login(formData)
      } else {
        await signup(formData)
        setMode('verification')
      }
    } catch (err) {
      console.error('Client-side auth form error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'verification') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <p>
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </p>
            <p>
              Please check your email and click the link to verify your account.
            </p>
            <Button variant="outline" onClick={() => setMode('signin')}>
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conditionally display report info */}
        {source === 'report_request' && (
          <Alert className="mb-4">
            <AlertTitle>Report Processing</AlertTitle>
            <AlertDescription>
              Your website analysis report is being generated. Please sign in or
              create an account to view it in your dashboard once it&apos;s
              ready.
            </AlertDescription>
          </Alert>
        )}

        {/* Google One Tap Component */}
        <OneTapComponent />

        {/* Delimiter */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          <div className="space-y-2 w-[300px]">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2 w-[300px]">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 text-sm rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 w-[300px]">
              {error}
            </div>
          )}

          <Button type="submit" className="w-[300px]" disabled={isLoading}>
            {isLoading
              ? 'Loading...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
