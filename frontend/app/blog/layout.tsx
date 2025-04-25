'use client'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/layout/Header'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-28">{children}</main>
      <Footer />
    </div>
  )
}
