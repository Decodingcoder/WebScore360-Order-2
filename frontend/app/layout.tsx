// frontend/app/layout.tsx

import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'WebScore360 - Comprehensive Website Analysis',
  description:
    'Get a complete analysis of your website with WebScore360. Performance, SEO, conversion, branding, and online presence all in one score.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">



      {/* ── INSERTION OF PIXEL & GA4 SNIPPETS START ── */}
      <head>
        {/* ─── Meta Pixel START ─── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
              }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1049772167003178');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1049772167003178&ev=PageView&noscript=1"
          />
        </noscript>
        {/* ─── Meta Pixel END ─── */}



        {/* ─── Google Analytics (GA4) START ─── */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-ZE4YVY4HV4"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZE4YVY4HV4');
            `,
          }}
        />
        {/* ─── Google Analytics (GA4) END ─── */}
      </head>



      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
