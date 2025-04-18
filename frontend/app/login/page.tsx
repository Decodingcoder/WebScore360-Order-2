import GoogleLoginButton from '@/components/GoogleLoginButton'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="WebScore360 Logo"
            width={100}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                Welcome to WebScore360
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to access your dashboard and reports
              </p>
            </div>

            <GoogleLoginButton />

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                By continuing, you agree to WebScore360&apos;s Terms of Service
                and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="WebScore360 Logo"
                width={75}
                height={30}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} WebScore360. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
