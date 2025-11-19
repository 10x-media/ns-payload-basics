import { Button } from '@/components/ui/button'
import type { SiteSetting } from '@/payload-types'
import Link from 'next/link'

export type HeaderContent = Pick<SiteSetting, 'logoText' | 'navLinks' | 'cta'>

type HeaderProps = {
  header: HeaderContent
  userEmail?: string
}

export function Header({ header, userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="text-lg font-semibold">{header.logoText}</div>
        </div>
        <nav className="hidden gap-6 md:flex">
          {header.navLinks?.map((link) => (
            <Link
              key={link.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
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
