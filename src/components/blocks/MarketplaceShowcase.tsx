import type { Page } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MarketplaceShowcaseType = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: 'marketplaceShowcase' }
>

export function MarketplaceShowcase({ data }: { data: MarketplaceShowcaseType }) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-3xl font-semibold">{data.title}</h2>
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
        </div>
      </div>
      {data.features && data.features.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {data.features.map((feature, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{feature.name}</CardTitle>
                  {feature.metric && (
                    <span className="text-sm text-muted-foreground">{feature.metric}</span>
                  )}
                </div>
                {feature.badge && <Badge variant="secondary">{feature.badge}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.summary}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
