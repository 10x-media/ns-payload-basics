import { getPayload } from 'payload'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { Page } from '@/payload-types'
import { draftMode } from 'next/headers'

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

  const { isEnabled: draftModeEnabled } = await draftMode()

  const pages = await payload.find({
    collection: 'pages',
    draft: draftModeEnabled,
    overrideAccess: draftModeEnabled,
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
