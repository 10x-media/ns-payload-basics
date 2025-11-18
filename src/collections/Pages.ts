import type { CollectionConfig } from 'payload'

import { HeroSection } from '@/blocks/HeroSection'
import { MarketplaceShowcase } from '@/blocks/MarketplaceShowcase'
import { TestimonialsSection } from '@/blocks/TestimonialsSection'

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
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout builder',
      required: true,
      blocks: [HeroSection, MarketplaceShowcase, TestimonialsSection],
    },
  ],
}
