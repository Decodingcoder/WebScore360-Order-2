'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ScoreCardProps {
  title: string
  score: number
  description: string
}

export default function ScoreCard({
  title,
  score,
  description,
}: ScoreCardProps) {
  // Determine color based on score
  const getColorClass = () => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="flex flex-col items-center text-center">
      <CardContent className="pt-6">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${getColorClass()}`}
        >
          {Math.round(score)}
        </div>
        <h3 className="text-lg font-medium mt-2 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
