'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import BillingOptions from './BillingOptions'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  planName: 'Pro' | 'Business+'
}

export default function UpgradeModal({
  isOpen,
  onClose,
  planName,
}: UpgradeModalProps) {
  // Get proper pricing based on plan
  const monthlyPrice = planName === 'Pro' ? 9 : 38
  const yearlyPrice = planName === 'Pro' ? 81 : 342

  const handleContinue = (
    billingFrequency: 'monthly' | 'yearly',
    price: number
  ) => {
    console.log(
      `Processing ${planName} plan, ${billingFrequency} billing at $${price}`
    )
    // Here we would typically redirect to the checkout page or show a checkout form
    // For MVP, just close the modal after logging
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to {planName}</DialogTitle>
        </DialogHeader>
        <BillingOptions
          planName={planName}
          monthlyPrice={monthlyPrice}
          yearlyPrice={yearlyPrice}
          onContinue={handleContinue}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  )
}
