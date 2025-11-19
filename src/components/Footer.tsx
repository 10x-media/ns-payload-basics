import React from 'react'

import { Separator } from '@/components/ui/separator'
import type { SiteSetting } from '@/payload-types'

export type FooterContent = Pick<SiteSetting, 'headline' | 'description' | 'links' | 'legal'>

type FooterProps = {
  footer: FooterContent
}

export function Footer({ footer }: FooterProps) {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 max-w-xl">
          {footer.headline && <h3 className="text-2xl font-semibold">{footer.headline}</h3>}
          {footer.description && <p className="text-muted-foreground">{footer.description}</p>}
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
          </div>
        </div>
      </div>
    </footer>
  )
}
