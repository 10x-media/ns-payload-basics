import { getPayload } from 'payload'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Page } from '@/payload-types'
import config from '@/payload.config'

type Section = NonNullable<Page['layout']>[number]

const LANDING_PAGE_SLUG = process.env.NEXT_PUBLIC_LANDING_PAGE_SLUG ?? 'landing'

const FALLBACK_SECTIONS: NonNullable<Page['layout']> = [
  {
    id: 'hero-fallback',
    blockType: 'heroSection',
    eyebrow: 'Powered by Payload',
    headline: 'Sell faster with a modern marketplace stack.',
    subheading:
      'Mercato bundles storefront, vendor tooling, and trust & safety primitives so your operators can launch curated marketplaces in weeks—not quarters.',
    primaryCtaLabel: 'Preview admin',
    primaryCtaHref: '/admin',
    secondaryCtaLabel: 'View docs',
    secondaryCtaHref: 'https://payloadcms.com/docs',
    stats: [
      { value: '$1.2B', label: 'GMV processed' },
      { value: '8,400', label: 'Active vendors' },
      { value: '42%', label: 'Faster onboarding' },
    ],
  },
  {
    id: 'showcase-fallback',
    blockType: 'marketplaceShowcase',
    title: 'Purpose-built for curated markets',
    description:
      'Pair structured inventory with verified vendor profiles and AI-powered merchandising blocks.',
    features: [
      {
        name: 'Dynamic collections',
        metric: 'Live',
        summary: 'Automate curation with attribute-based filters, waitlists, and quotas.',
        badge: 'Workflow builder',
      },
      {
        name: 'Vendor trust graph',
        metric: '92% verified',
        summary: 'First-party verifications, payouts, and compliance events in one log.',
        badge: 'Risk tooling',
      },
      {
        name: 'Headless storefront',
        metric: '2.3s TTFB',
        summary: 'Deploy a themeable buyer experience with shadcn/ui primitives.',
        badge: 'SDKs',
      },
    ],
  },
  {
    id: 'testimonials-fallback',
    blockType: 'testimonialsSection',
    title: 'Operators who switched to Payload',
    supportingText:
      'From B2B industrials to consumer marketplaces, teams choose Payload to own their data model and admin UI.',
    testimonials: [
      {
        quote:
          'Payload let us model vendor payouts, disputes, and approvals exactly the way our ops team runs. We shipped in six weeks and audit trails are built-in.',
        authorName: 'Marina Patel',
        authorRole: 'COO',
        company: 'Arcadia Makers',
      },
      {
        quote:
          'The block-based landing page is fully editable by our merchandising team. It feels like @payloadcms shipped a headless Shopify for marketplaces.',
        authorName: 'Leo Kramer',
        authorRole: 'Founder',
        company: 'Fieldstack',
      },
    ],
  },
] as NonNullable<Page['layout']>

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const landingPage = await payload
    .find({
      collection: 'pages',
      where: {
        slug: {
          equals: LANDING_PAGE_SLUG,
        },
      },
      limit: 1,
      depth: 2,
    })
    .then((res) => res.docs?.[0] ?? null)
    .catch(() => null as Page | null)
  const sections =
    landingPage?.layout && landingPage.layout.length > 0 ? landingPage.layout : FALLBACK_SECTIONS

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id ?? section.blockType} section={section} />
      ))}
    </>
  )
}

function SectionRenderer({ section }: { section: Section }) {
  switch (section.blockType) {
    case 'heroSection':
      return <HeroBlock data={section} />
    case 'marketplaceShowcase':
      return <MarketplaceShowcaseBlock data={section} />
    case 'testimonialsSection':
      return <TestimonialsBlock data={section} />
    default:
      return null
  }
}

function HeroBlock({ data }: { data: Extract<Section, { blockType: 'heroSection' }> }) {
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
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Marketplace Impact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {data.stats?.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

function MarketplaceShowcaseBlock({
  data,
}: {
  data: Extract<Section, { blockType: 'marketplaceShowcase' }>
}) {
  return (
    <section id="vendors" className="space-y-6">
      <div className="space-y-3">
        <Badge variant="outline">Vendor platform</Badge>
        <div>
          <h2 className="text-3xl font-semibold">{data.title}</h2>
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {data.features?.map((feature, idx) => (
          <Card key={`${feature.name}-${idx}`} className="flex flex-col">
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
    </section>
  )
}

function TestimonialsBlock({
  data,
}: {
  data: Extract<Section, { blockType: 'testimonialsSection' }>
}) {
  return (
    <section id="stories" className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold">{data.title}</h2>
        {data.supportingText && <p className="text-muted-foreground">{data.supportingText}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.testimonials?.map((testimonial, idx) => (
          <Card key={`${testimonial.authorName}-${idx}`} className="flex flex-col">
            <CardContent className="flex h-full flex-col gap-6 pt-6">
              <p className="text-lg leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{getInitials(testimonial.authorName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.authorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.authorRole}
                    {testimonial.company ? ` · ${testimonial.company}` : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function getInitials(name?: string | null) {
  if (!name) return '??'
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return initials.join('') || '??'
}
