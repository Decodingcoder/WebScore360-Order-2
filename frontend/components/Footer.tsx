import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Globe
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-xl font-bold mb-4">WebScore360</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Helping businesses improve their online presence with data-driven
              insights.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:webscore360@gmail.com"
                  className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* SOCIAL MEDIA + CONTACT ICONS */}
        <div className="mt-12 flex flex-col items-center space-y-6">
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://www.linkedin.com/company/webscore360/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="text-gray-600 dark:text-gray-300 hover:text-blue-600 w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@WebScore360"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="text-gray-600 dark:text-gray-300 hover:text-red-600 w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61574158077776&mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="text-gray-600 dark:text-gray-300 hover:text-blue-700 w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/webscore360/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="text-gray-600 dark:text-gray-300 hover:text-pink-500 w-5 h-5" />
            </a>
            <a
              href="https://x.com/WebScore360"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="text-gray-600 dark:text-gray-300 hover:text-blue-500 w-5 h-5" />
            </a>
            <a
              href="https://g.co/kgs/AapU8kt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="text-gray-600 dark:text-gray-300 hover:text-green-600 w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-6 text-center text-sm text-gray-600 dark:text-gray-300">
            <a href="tel:18884551551" className="flex items-center justify-center hover:underline mb-1 sm:mb-0">
              <Phone className="mr-1 w-4 h-4" /> 1-888-455-1551
            </a>
            <a href="mailto:support@webscore360.com" className="flex items-center justify-center hover:underline">
              <Mail className="mr-1 w-4 h-4" /> support@webscore360.com
            </a>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} WebScore360. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
