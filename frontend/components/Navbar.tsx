import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            WebScore360
          </Link>
        </div>

        <div className="hidden md:flex space-x-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            About
          </Link>
          <Link
            href="/#contact"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Contact
          </Link>
        </div>

        <div className="md:hidden">
          {/* Mobile menu button - would normally toggle a menu */}
          <button className="text-gray-600 dark:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
