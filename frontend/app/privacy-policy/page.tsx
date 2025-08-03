import { Footer } from '@/components/Footer'
import { Header } from '@/components/layout/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | WebScore360',
  description: 'Privacy Policy for WebScore360',
}

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 pt-28 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Privacy Policy
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Last Updated: July 30, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              WebScore360 ("we," "our," or "us") complies with:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Canada: PIPEDA, Quebec Law 25</li>
              <li>United States: CCPA/CPRA, TCPA, CTIA Guidelines, State Laws (VCDPA, CPA, etc.)</li>
              <li>European Union: GDPR</li>
            </ul>
            <p className="mb-4">
              By using our services, you consent to this policy. Discontinue use if you disagree.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">SMS/Text Message Compliance (U.S. Only)</h2>
            <h3 className="text-xl font-medium mb-3">Standalone Consent Disclosure</h3>
            <p className="mb-4">
              When you provide your phone number (e.g., via web forms, checkout), you will see:
            </p>
            <blockquote className="mb-4 pl-4 border-l-4 border-gray-300 italic text-sm">
              "By submitting, you agree to receive [autodialed] marketing texts/calls from WebScore360. Message frequency may vary. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to unsubscribe or HELP for assistance."
            </blockquote>
            <h3 className="text-xl font-medium mb-3">Key Features</h3>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Message Frequency: Disclosed upfront ("may vary" for variable messaging)</li>
              <li>Opt-Out: Reply STOP (SMS) or email (calls) – processed within 5 minutes</li>
              <li>No Pre-Checked Boxes: Consent requires affirmative action</li>
              <li>Separate from Privacy Policy: This disclosure appears at point of collection</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">SMS Data Practices</h3>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Retention: Phone numbers and consent records stored for 5 years (TCPA compliance)</li>
              <li>Third Parties: SMS providers (e.g., Twilio) bound by strict confidentiality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">General Data Collection & Use</h2>
            <h3 className="text-xl font-medium mb-3">Information We Collect</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full table-auto border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Category</th>
                    <th className="border px-4 py-2 text-left">Examples</th>
                    <th className="border px-4 py-2 text-left">Legal Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Identifiers</td>
                    <td className="border px-4 py-2">Name, email, phone, IP address</td>
                    <td className="border px-4 py-2">Consent/Contract</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Commercial Data</td>
                    <td className="border px-4 py-2">Purchase history</td>
                    <td className="border px-4 py-2">Contract</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Sensitive Data</td>
                    <td className="border px-4 py-2">Payment info, location</td>
                    <td className="border px-4 py-2">Consent/Legal Obligation</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Device/Usage Data</td>
                    <td className="border px-4 py-2">Cookies, browser type</td>
                    <td className="border px-4 py-2">Legitimate Interest</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">
              Sensitive data is collected only with explicit opt-in where required.
            </p>
            <h3 className="text-xl font-medium mb-3">How We Use Data</h3>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Provide services (contract)</li>
              <li>Send opt-in marketing (consent)</li>
              <li>Prevent fraud (legitimate interest)</li>
              <li>Comply with laws (legal obligation)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Essential: Always on (no consent needed)</li>
              <li>Non-Essential: Disabled by default (GDPR). Opt-in via cookie banner</li>
              <li>U.S. GPC Support: Honor Global Privacy Control signals</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Sharing</h2>
            <p className="mb-4">We use:</p>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Payment processors (Stripe, PayPal)</li>
              <li>Email/SMS providers (Twilio, Mailchimp)</li>
              <li>Analytics (Google Analytics with anonymization)</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">U.S. Opt-Out:</h3>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>"Do Not Sell/Share My Info" link (website footer)</li>
              <li>GPC-enabled browsers automatically respected</li>
            </ul>
            <p className="mb-4">
              EU Safeguards: Data transfers use SCCs or Adequacy Decisions
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full table-auto border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Region</th>
                    <th className="border px-4 py-2 text-left">Rights</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Canada</td>
                    <td className="border px-4 py-2">Access, correction, complaint to Privacy Commissioner</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">United States</td>
                    <td className="border px-4 py-2">Opt-out of sales/sharing, deletion, SMS opt-out (STOP), nondiscrimination</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">European Union</td>
                    <td className="border px-4 py-2">Erasure, portability, objection, lodge complaints with a DPA</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">
              Submit requests to <a href="mailto:privacy@webscore360.com" className="text-primary hover:underline">privacy@webscore360.com</a> (respond within 30 days)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Policy Updates</h2>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Notify users 30 days before material changes (GDPR/CCPA)</li>
              <li>SMS users receive updated opt-out instructions with messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <ul className="list-disc pl-8 mb-4 space-y-1">
              <li>Privacy Officer (Canada): Meghan Robinson (<a href="mailto:Meghan.robinson@webscore360.com" className="text-primary hover:underline">Meghan.robinson@webscore360.com</a>)</li>
              <li>DPO (EU): Meghan Robinson (<a href="mailto:Meghan.robinson@webscore360.com" className="text-primary hover:underline">Meghan.robinson@webscore360.com</a>)</li>
              <li>U.S. Requests: <a href="mailto:privacy@webscore360.com" className="text-primary hover:underline">privacy@webscore360.com</a> or 1-888-455-1551</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}