import Link from 'next/link'
import { ReactNode } from 'react'

type BlogPostLayoutProps = {
  title: string
  date: string
  children: ReactNode
}

export default function BlogPostLayout({
  title,
  date,
  children,
}: BlogPostLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <article className="text-gray-800 dark:text-gray-200">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
          {title}
        </h1>

        <div className="text-gray-500 dark:text-gray-400 mb-8">
          Published on {date}
        </div>

        {children}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to all articles
          </Link>
        </div>
      </article>
    </div>
  )
}
