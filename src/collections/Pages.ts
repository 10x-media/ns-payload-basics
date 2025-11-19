import { slugField, type CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { HeroSection } from '@/blocks/HeroSection'
import { MarketplaceShowcase } from '@/blocks/MarketplaceShowcase'
import { TestimonialsSection } from '@/blocks/TestimonialsSection'
import { generatePreviewPath } from '@/lib/utils'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    group: 'CMS',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        if (!data?.slug) return ''

        const pathname = data.slug === 'home' ? '/' : `/${data.slug}`

        return generatePreviewPath({ pathname })
      },
    },
    preview: (data) => {
      const pathname = data.slug === 'home' ? '/' : `/${data.slug}`
      return generatePreviewPath({ pathname })
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
        revalidatePath(path)
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
        revalidatePath(path)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({}),
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout builder',
      required: true,
      blocks: [HeroSection, MarketplaceShowcase, TestimonialsSection],
    },
  ],
}
