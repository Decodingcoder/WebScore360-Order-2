export default function ErrorPage() {
  return (
    <div>
      <h1>Authentication Error</h1>
      <p>There was an error during the authentication process.</p>
      <p>
        Please try signing in again or contact support if the issue persists.
      </p>
      {/* You might want to add a link back to the login page */}
      {/* <Link href="/login">Go to Login</Link> */}
    </div>
  )
}
