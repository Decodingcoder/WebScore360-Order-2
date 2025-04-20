'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ScoreCardProps {
  title: string
  score: number | null
  description: string
}

export default function ScoreCard({
  title,
  score,
  description,
}: ScoreCardProps) {
  // Determine color based on score
  const getColorClass = () => {
    // Handle null case
    if (score === null) {
      return 'bg-gray-400 dark:bg-gray-600' // Neutral color for null/pending
    }
    // Existing logic for actual scores
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="flex flex-col items-center text-center h-full">
      <CardContent className="pt-6 flex flex-col flex-grow">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${getColorClass()} shrink-0 mx-auto`}
        >
          {/* Conditionally display score or placeholder */}
          {score !== null ? Math.round(score) : '-'}
        </div>
        <h3 className="text-lg font-medium mt-2 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
