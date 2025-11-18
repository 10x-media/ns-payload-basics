import type { Page } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HeroSectionType = Extract<NonNullable<Page['layout']>[number], { blockType: 'heroSection' }>

export function HeroSection({ data }: { data: HeroSectionType }) {
  return (
    <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {data.eyebrow && (
          <Badge variant="secondary" className="uppercase tracking-wide">
            {data.eyebrow}
          </Badge>
        )}
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{data.headline}</h1>
          {data.subheading && <p className="text-lg text-muted-foreground">{data.subheading}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {data.primaryCtaHref && data.primaryCtaLabel && (
            <Button size="lg" asChild>
              <a href={data.primaryCtaHref}>{data.primaryCtaLabel}</a>
            </Button>
          )}
          {data.secondaryCtaHref && data.secondaryCtaLabel && (
            <Button size="lg" variant="outline" asChild>
              <a href={data.secondaryCtaHref}>{data.secondaryCtaLabel}</a>
            </Button>
          )}
        </div>
      </div>
      {data.stats && data.stats.length > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            {data.stats.map((stat, index) => (
              <div key={index} className="space-y-1">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  )
}
