'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

interface BillingOptionsProps {
  planName: string
  monthlyPrice: number
  yearlyPrice: number
  onContinue: (billingFrequency: 'monthly' | 'yearly', price: number) => void
  className?: string
}

export default function BillingOptions({
  planName,
  monthlyPrice,
  yearlyPrice,
  onContinue,
  className = '',
}: BillingOptionsProps) {
  const [billingFrequency, setBillingFrequency] = useState<
    'monthly' | 'yearly'
  >('monthly')

  const yearlySavings = Math.round(monthlyPrice * 12 - yearlyPrice)
  const yearlyDiscountPercentage = Math.round(
    (1 - yearlyPrice / (monthlyPrice * 12)) * 100
  )

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          Choose your billing option
        </h3>
        <p className="text-gray-500 mb-6">{planName} Plan</p>

        <div className="space-y-4">
          <div
            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              billingFrequency === 'monthly'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : ''
            }`}
            onClick={() => setBillingFrequency('monthly')}
          >
            <div
              className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                billingFrequency === 'monthly' ? 'border-blue-500' : ''
              }`}
            >
              {billingFrequency === 'monthly' && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Monthly</p>
              <p className="text-sm text-gray-500">${monthlyPrice}/month</p>
            </div>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 relative ${
              billingFrequency === 'yearly'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : ''
            }`}
            onClick={() => setBillingFrequency('yearly')}
          >
            <div
              className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                billingFrequency === 'yearly' ? 'border-blue-500' : ''
              }`}
            >
              {billingFrequency === 'yearly' && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Annual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-sm text-gray-500">${yearlyPrice}/year</p>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Save ${yearlySavings} ({yearlyDiscountPercentage}% off)
                </span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-md dark:bg-green-900 dark:text-green-100">
              Best value
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-6"
          onClick={() =>
            onContinue(
              billingFrequency,
              billingFrequency === 'monthly' ? monthlyPrice : yearlyPrice
            )
          }
        >
          Continue to checkout
        </Button>
      </CardContent>
    </Card>
  )
}
