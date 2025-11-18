import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'

import { Header } from '../../components/Header'
import type { HeaderContent } from '../../components/Header'
import { Footer } from '../../components/Footer'
import type { FooterContent } from '../../components/Footer'
import type { SiteSetting } from '@/payload-types'
import config from '@/payload.config'
import '@/styles/globals.css'

const FALLBACK_HEADER: HeaderContent = {
  logoText: 'Mercato',
  tagline: 'Marketplace starter crafted with Payload',
  navLinks: [
    { label: 'Vendors', href: '#vendors' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Stories', href: '#stories' },
  ],
  cta: {
    label: 'Launch marketplace',
    href: '/admin',
  },
}

const FALLBACK_FOOTER: FooterContent = {
  headline: 'Ready to build on Payload?',
  description: 'Deploy the admin dashboard, seed your globals, and invite vendors today.',
  links: [
    { label: 'Product roadmap', href: 'https://payloadcms.com/roadmap' },
    { label: 'Payload @GitHub', href: 'https://github.com/payloadcms/payload' },
    { label: 'Support', href: 'https://payloadcms.com/support' },
  ],
  legal: [
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
  ],
}

export const metadata = {
  description: 'Discover curated products, vetted vendors, and secure checkout built on Payload.',
  title: 'Mercato — Marketplace starter built with Payload',
}

export default async function RootLayout(props: { children: ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [{ user }, siteSettings] = await Promise.all([
    payload.auth({ headers }).catch(() => ({ user: null as null | { email?: string | null } })),
    payload
      .findGlobal({
        slug: 'site-settings',
        depth: 2,
      })
      .catch(() => null) as Promise<SiteSetting | null>,
  ])

  type SiteSettingsWithLayout = SiteSetting & {
    header?: HeaderContent
    footer?: FooterContent
  }

  const siteSettingsWithLayout = siteSettings as SiteSettingsWithLayout | null

  const header = siteSettingsWithLayout?.header ?? FALLBACK_HEADER
  const footer = siteSettingsWithLayout?.footer ?? FALLBACK_FOOTER

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          <Header header={header} userEmail={user?.email ?? undefined} />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 md:py-20">
            {children}
          </main>
          <Footer footer={footer} />
        </div>
      </body>
    </html>
  )
}
