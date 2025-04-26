'use client'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(
    'month'
  )

  return (
    <div className="relative isolate overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 pt-28 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Find the perfect plan for your website analysis needs
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span
              className={`text-sm ${
                billingInterval === 'month' ? 'font-bold' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              className={`relative h-8 w-16 px-0 ${
                billingInterval === 'year'
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : ''
              }`}
              onClick={() => setBillingInterval('year')}
            >
              <span
                className={`absolute inset-0 h-full w-1/2 rounded-md bg-blue-600 transition-all ${
                  billingInterval === 'year'
                    ? 'translate-x-full -ml-1.5'
                    : 'translate-x-0 ml-0.5'
                }`}
              />
              <span className="sr-only">
                {billingInterval === 'year'
                  ? 'Switch to monthly billing'
                  : 'Switch to annual billing'}
              </span>
            </Button>
            <span
              className={`text-sm ${
                billingInterval === 'year' ? 'font-bold' : 'text-gray-500'
              }`}
            >
              Annual{' '}
              <span className="text-green-600 dark:text-green-400 font-medium">
                (Save 25%)
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
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
            <div className="p-6">
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
                  <span>Priority support</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full mt-8">
                <Link href="/login">Get Started Free</Link>
              </Button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border-2 border-blue-500 dark:border-blue-400 transform md:scale-105 relative z-10">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
              POPULAR
            </div>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40">
              <h3 className="text-2xl font-bold">Pro</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-5xl font-extrabold">
                  {billingInterval === 'year' ? '$81' : '$9'}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  {billingInterval === 'year' ? '/year' : '/month'}
                </span>
              </div>
              {billingInterval === 'year' ? (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  Save $27 per year
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  or $81/year (save 25%)
                </p>
              )}
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                For small businesses focused on growth.
              </p>
            </div>
            <div className="p-6">
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
                  <span>Email report delivery</span>
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
              <Button
                variant="default"
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/login">Get Started Free</Link>
              </Button>
            </div>
          </div>

          {/* Business+ Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg opacity-70">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40">
              <h3 className="text-2xl font-bold">Business+ (Coming Soon)</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-5xl font-extrabold">
                  {billingInterval === 'year' ? '$342' : '$38'}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  {billingInterval === 'year' ? '/year' : '/month'}
                </span>
              </div>
              {billingInterval === 'year' ? (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  Save $114 per year
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  or $342/year (save 25%)
                </p>
              )}
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                For agencies and growing businesses.
              </p>
            </div>
            <div className="p-6">
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
                  <span>Service discounts available</span>
                </li>
              </ul>
              <Button
                variant="default"
                className="w-full mt-8 bg-purple-600 hover:bg-purple-700 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-4 px-6 text-left font-semibold">Feature</th>
                  <th className="py-4 px-6 text-center font-semibold">Free</th>
                  <th className="py-4 px-6 text-center font-semibold">Pro</th>
                  <th className="py-4 px-6 text-center font-semibold">
                    Business+
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-6 font-medium">Monthly Audits</td>
                  <td className="py-4 px-6 text-center">1</td>
                  <td className="py-4 px-6 text-center">30</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Score Breakdown</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center">Detailed</td>
                  <td className="py-4 px-6 text-center">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Fix-It Guidance</td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">
                    Competitor Benchmarking
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Priority Support</td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Service Discounts</td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-red-500 mx-auto"
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
                  </td>
                  <td className="py-4 px-6 text-center">
                    <svg
                      className="h-6 w-6 text-green-500 mx-auto"
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">
                Can I change plans at any time?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately, with prorated billing for upgrades and
                changes applied at the next billing cycle for downgrades.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, including Visa, Mastercard,
                and American Express. You can also pay with PayPal.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer a 14-day money-back guarantee for all paid plans. If
                you&apos;re not satisfied with our service within this period,
                please contact our support team for a full refund.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">
                What&apos;s included in competitor benchmarking?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Competitor benchmarking allows you to compare your website
                scores against up to 3 competitor websites. You&apos;ll see how
                you stack up in each category: Performance, SEO, Conversion,
                Branding, and Online Presence.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  )
}
