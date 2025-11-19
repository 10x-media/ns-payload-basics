import { getPayload } from 'payload'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { Page } from '@/payload-types'

type Props = {
  params: Promise<{
    segments?: string[]
  }>
}

export default async function DynamicPage({ params }: Props) {
  const { segments } = await params
  const slug = segments?.join('/') || 'home'
  console.log(slug)

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

  return (
    <div className="space-y-16">
      <RenderBlocks blocks={page?.layout} />
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

  return pages.docs.map((page: Page) => ({
    segments: page.slug.split('/').filter(Boolean),
  }))
}

export const revalidate = 60 // Revalidate every 60 seconds
