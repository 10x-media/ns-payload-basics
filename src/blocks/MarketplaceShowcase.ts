import type { Block } from 'payload'

export const MarketplaceShowcase: Block = {
  slug: 'marketplaceShowcase',
  labels: {
    singular: 'Marketplace Showcase',
    plural: 'Marketplace Showcase Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      labels: {
        singular: 'Feature',
        plural: 'Features',
      },
      required: true,
      minRows: 3,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Name',
              required: true,
            },
            {
              name: 'metric',
              type: 'text',
              label: 'Metric',
            },
          ],
        },
        {
          name: 'summary',
          type: 'textarea',
          label: 'Summary',
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Badge',
        },
      ],
    },
  ],
}

