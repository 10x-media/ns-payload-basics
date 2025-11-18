import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { SiteSetting } from '@/payload-types'
import config from '@/payload.config'
import '@/styles/globals.css'

const FALLBACK_HEADER: NonNullable<SiteSetting['header']> = {
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

const FALLBACK_FOOTER: NonNullable<SiteSetting['footer']> = {
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

export default async function RootLayout(props: { children: React.ReactNode }) {
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

  const header = siteSettings?.header ?? FALLBACK_HEADER
  const footer = siteSettings?.footer ?? FALLBACK_FOOTER

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

function Header({
  header,
  userEmail,
}: {
  header: NonNullable<SiteSetting['header']>
  userEmail?: string
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="text-lg font-semibold">{header.logoText}</div>
          {header.tagline && <p className="text-sm text-muted-foreground">{header.tagline}</p>}
        </div>
        <nav className="hidden gap-6 md:flex">
          {header.navLinks?.map((link) => (
            <a
              key={link.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden text-sm text-muted-foreground md:inline">Hi, {userEmail}</span>
          )}
          {header.cta?.href && header.cta?.label && (
            <Button asChild>
              <a href={header.cta.href}>{header.cta.label}</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer({ footer }: { footer: NonNullable<SiteSetting['footer']> }) {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 max-w-xl">
          {footer.headline && <h3 className="text-2xl font-semibold">{footer.headline}</h3>}
          {footer.description && <p className="text-muted-foreground">{footer.description}</p>}
          {footer.links && footer.links.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              {footer.links.map((link) => (
                <a
                  key={link.href}
                  className="text-muted-foreground transition hover:text-foreground"
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {footer.legal?.map((item, idx) => (
              <React.Fragment key={item.href}>
                <a className="hover:text-foreground" href={item.href}>
                  {item.label}
                </a>
                {idx < (footer.legal?.length ?? 0) - 1 && (
                  <Separator orientation="vertical" className="hidden h-4 md:inline" />
                )}
              </React.Fragment>
            ))}
            <span className="text-muted-foreground">@Payload ready</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
