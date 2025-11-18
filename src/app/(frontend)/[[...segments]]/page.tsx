import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Page } from '@/payload-types'
import { RenderBlocks } from '@/components/RenderBlocks'

type Props = {
  params: Promise<{
    segments?: string[]
  }>
}

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

export default async function DynamicPage({ params }: Props) {
  const { segments } = await params
  const slug = segments?.join('/') || 'home'

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  const page = pages.docs[0]

  // Use page layout if it exists, otherwise use fallback sections
  const blocks = page?.layout && page.layout.length > 0 ? page.layout : FALLBACK_SECTIONS

  return (
    <div className="space-y-16">
      <RenderBlocks blocks={blocks} />
    </div>
  )
}

export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const pages = await payload.find({
    collection: 'pages',
    limit: 100,
    depth: 0,
  })

  return pages.docs.map((page) => ({
    segments: page.slug.split('/').filter(Boolean),
  }))
}

export const revalidate = 60 // Revalidate every 60 seconds
