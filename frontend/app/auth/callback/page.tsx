import AuthCallbackHandler from '@/components/AuthCallbackHandler'
import { Suspense } from 'react'

// This page route simply renders the client component responsible
// for handling the OAuth callback hash fragment.
// We wrap it in Suspense because AuthCallbackHandler uses useSearchParams.
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div> /* Basic fallback UI */}>
      <AuthCallbackHandler />
    </Suspense>
  )
}
