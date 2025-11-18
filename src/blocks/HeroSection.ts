import type { Block } from 'payload'

export const HeroSection: Block = {
  slug: 'heroSection',
  labels: {
    singular: 'Hero',
    plural: 'Hero Sections',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      required: false,
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      required: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryCtaLabel',
          type: 'text',
          label: 'Primary CTA Label',
        },
        {
          name: 'primaryCtaHref',
          type: 'text',
          label: 'Primary CTA Link',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          label: 'Secondary CTA Label',
        },
        {
          name: 'secondaryCtaHref',
          type: 'text',
          label: 'Secondary CTA Link',
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Stats',
      labels: {
        singular: 'Stat',
        plural: 'Stats',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Value',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
      ],
    },
  ],
}

