import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | WebScore360',
  description:
    'Learn more about WebScore360 - helping businesses improve their online presence',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="WebScore360 Logo"
            width={100}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            About WebScore360
          </h1>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              At WebScore360, we&apos;re committed to helping businesses of all
              sizes improve their online presence through data-driven insights
              and actionable recommendations. We believe that every business
              deserves to have a strong digital footprint that accurately
              represents their brand and effectively reaches their target
              audience.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              WebScore360 provides comprehensive website analysis tools that
              evaluate your site across multiple dimensions including
              performance, accessibility, SEO, user experience, and branding.
              Our platform generates detailed reports with specific
              recommendations to help you optimize your website and stay ahead
              of the competition.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">
                  Comprehensive Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our 360° evaluation examines every aspect of your online
                  presence to identify strengths and areas for improvement.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">
                  Actionable Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We don&apos;t just identify issues—we provide clear
                  recommendations on how to fix them and improve your online
                  performance.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">
                  Competitive Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See how you stack up against competitors and discover
                  opportunities to gain an edge in your market.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-3">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your improvement over time with regular reports and
                  updates on your digital performance.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              WebScore360 was founded by a team of digital marketing experts,
              web developers, and data analysts who share a passion for helping
              businesses succeed online. With years of experience across various
              industries, our team brings a wealth of knowledge and expertise to
              every analysis and recommendation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              We&apos;re always looking to connect with businesses that want to
              improve their online presence. Whether you have questions about
              our services or want to learn more about how we can help your
              business, we&apos;d love to hear from you.
            </p>
            <div className="flex justify-center mt-6">
              <a
                href="mailto:sales@webscore360.com"
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
