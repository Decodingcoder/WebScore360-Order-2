'use client'

export default function GoogleButtonSkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-full h-10 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse flex items-center justify-center">
        <div className="w-5 h-5 mr-2 rounded-full bg-gray-200 dark:bg-gray-600"></div>
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  )
}
