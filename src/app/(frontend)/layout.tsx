import { getPayload } from 'payload'
import type { ReactNode } from 'react'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import type { SiteSetting } from '@/payload-types'
import config from '@/payload.config'
import '@/styles/globals.css'

export const metadata = {
  description: 'Discover curated products, vetted vendors, and secure checkout built on Payload.',
  title: 'Mercato — Marketplace starter built with Payload',
}

export default async function RootLayout(props: { children: ReactNode }) {
  const { children } = props

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  })

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          <Header header={siteSettings ?? { logoText: 'Mercato' }} />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 md:py-20">
            {children}
          </main>
          <Footer footer={siteSettings ?? {}} />
        </div>
      </body>
    </html>
  )
}
