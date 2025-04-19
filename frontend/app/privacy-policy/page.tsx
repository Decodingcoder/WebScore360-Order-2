import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | WebScore360',
  description: 'Privacy Policy for WebScore360',
}

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Last Updated: October 15, 2023
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              WebScore360 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our services.
            </p>
            <p className="mb-4">
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              site or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <p className="mb-4">
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Register for our services or sign up for our newsletter</li>
              <li>Request a business analysis report</li>
              <li>
                Fill out a form or submit a question through our contact page
              </li>
              <li>Participate in our beta program or referral program</li>
              <li>Purchase our products or services</li>
            </ul>
            <p className="mb-4">
              The personal information we may collect includes:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>First and last name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Business name and website URL</li>
              <li>Billing information and payment details</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">
              Automatically Collected Information
            </h3>
            <p className="mb-4">
              When you access our website, we may automatically collect certain
              information about your device, including:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website</li>
              <li>Time and date of your visit</li>
              <li>Pages you view</li>
              <li>Links you click</li>
              <li>Other browsing behavior</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">
              We may use the information we collect for various purposes,
              including to:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send administrative information, such as updates or changes to
                our policies
              </li>
              <li>Respond to comments, questions, and requests</li>
              <li>Send marketing communications and promotional materials</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>
                Protect against, identify, and prevent fraud and other illegal
                activity
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Cookies and Tracking Technologies
            </h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track activity
              on our website and hold certain information. Cookies are files
              with small amounts of data that may include an anonymous unique
              identifier.
            </p>
            <p className="mb-4">
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Third-Party Service Providers
            </h2>
            <p className="mb-4">
              We may employ third-party companies and individuals due to the
              following reasons:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>To facilitate our service</li>
              <li>To provide the service on our behalf</li>
              <li>To perform service-related services</li>
              <li>To assist us in analyzing how our service is used</li>
            </ul>
            <p className="mb-4">
              These third parties have access to your personal information only
              to perform these tasks on our behalf and are obligated not to
              disclose or use it for any other purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="mb-4">
              We will retain your personal information only for as long as is
              necessary for the purposes set out in this privacy policy. We will
              retain and use your information to the extent necessary to comply
              with our legal obligations, resolve disputes, and enforce our
              policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="mb-4">
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Your Data Protection Rights
            </h2>
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding
              your personal information, such as:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>
                The right to access the personal information we have about you
              </li>
              <li>
                The right to request that we correct any inaccurate personal
                information
              </li>
              <li>
                The right to request that we delete your personal information
              </li>
              <li>The right to withdraw consent to data processing</li>
              <li>The right to data portability</li>
              <li>The right to complain to a data protection authority</li>
            </ul>
            <p className="mb-4">
              To exercise any of these rights, please contact us using the
              information provided in the &quot;Contact Us&quot; section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="mb-4">
              Our service is not directed to individuals under the age of 18. We
              do not knowingly collect personal information from children under
              18. If we become aware that we have collected personal information
              from a child under age 18 without verification of parental
              consent, we will take steps to remove that information from our
              servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page
              and updating the &quot;Last Updated&quot; date at the top of this
              privacy policy.
            </p>
            <p className="mb-4">
              You are advised to review this privacy policy periodically for any
              changes. Changes to this privacy policy are effective when they
              are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or suggestions about our privacy policy,
              do not hesitate to contact us at:
            </p>
            <p className="mb-4">
              Email:{' '}
              <a
                href="mailto:privacy@webscore360.com"
                className="text-primary hover:underline"
              >
                privacy@webscore360.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
