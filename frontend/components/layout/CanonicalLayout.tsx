'use client'

import { usePathname } from 'next/navigation'
import Head from 'next/head'

const DOMAIN = 'https://webscore360.io' // ✅ Replace with your live site URL

export function CanonicalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const canonicalUrl = `${DOMAIN}${pathname === '/' ? '' : pathname}`

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} key="canonical" />
      </Head>
      {children}
    </>
  )
}
