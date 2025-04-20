'use client'

import { Footer } from '@/components/Footer'
import HomeForm from '@/components/HomeForm'
import { GridPattern } from '@/components/magicui/grid-pattern'
import { ShineBorder } from '@/components/magicui/shine-border'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const { session } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Handle client-side only rendering for auth check
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 z-50 py-4 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="WebScore360 Logo"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <nav className="flex gap-3">
            {mounted && session ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href="#pricing">Pricing</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-28 relative">
        <div className="absolute inset-0 w-full h-screen overflow-hidden pointer-events-none -z-10">
          <GridPattern
            width={50}
            height={50}
            x={-1}
            y={-1}
            strokeDasharray={'6 4'}
            className={cn(
              '[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]'
            )}
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Analyze Your Website In Minutes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get a comprehensive score across performance, SEO, conversion,
              branding, and online presence - all in one report.
            </p>
          </div>

          <Card className="max-w-lg mx-auto relative bg-white dark:bg-gray-800">
            <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
            <CardContent className="p-6">
              <HomeForm />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Performance</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyze page speed, security, and technical aspects of your
                  site.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">SEO</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Evaluate your search engine optimization and visibility
                  factors.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Conversion</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Check your site&apos;s ability to convert visitors into
                  customers.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Section */}
          <section id="pricing" className="py-20 mt-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Choose the plan that fits your needs. Upgrade or downgrade
                  anytime.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <Card className="transition-transform hover:scale-105 overflow-hidden bg-white dark:bg-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold">Free</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-5xl font-extrabold">$0</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Perfect for trying out WebScore360.
                    </p>
                  </div>
                  <CardContent className="p-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>1 website audit per month</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Basic score breakdown</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Email report delivery</span>
                      </li>
                      <li className="flex items-start opacity-50">
                        <svg
                          className="h-6 w-6 text-gray-400 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        <span>Detailed fix-it guidance</span>
                      </li>
                    </ul>
                    <Button variant="secondary" className="w-full mt-8" asChild>
                      <Link href="/login">Get Started Free</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="overflow-hidden transform scale-105 border-2 border-blue-500 dark:border-blue-400 relative z-10 bg-white dark:bg-gray-800">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                    POPULAR
                  </div>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40">
                    <h3 className="text-2xl font-bold">Pro</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-5xl font-extrabold">$9</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      or $81/year (save 25%)
                    </p>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      For small businesses focused on growth.
                    </p>
                  </div>
                  <CardContent className="p-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>
                          <strong>30</strong> website audits per month
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Detailed score breakdown</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Comprehensive fix-it guidance</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Priority email support</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-8" asChild>
                      <Link href="/login">Get Started with Pro</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Business+ Plan */}
                <Card className="transition-transform hover:scale-105 overflow-hidden bg-white dark:bg-gray-800">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40">
                    <h3 className="text-2xl font-bold">Business+</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-5xl font-extrabold">$38</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      or $342/year (save 25%)
                    </p>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      For agencies and growing businesses.
                    </p>
                  </div>
                  <CardContent className="p-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>
                          <strong>Unlimited</strong> website audits
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>All Pro features included</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Competitor benchmarking</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="h-6 w-6 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>Priority support & consultations</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-8" variant="secondary" asChild>
                      <Link href="/login">Get Business+</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 dark:text-gray-300">
                  Need a custom solution for your agency or enterprise?
                </p>
                <Button variant="link" asChild className="mt-2">
                  <a href="mailto:sales@webscore360.com">
                    Contact our sales team →
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
