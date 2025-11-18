import type { Block } from 'payload'

export const TestimonialsSection: Block = {
  slug: 'testimonialsSection',
  labels: {
    singular: 'Testimonial Section',
    plural: 'Testimonial Sections',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'supportingText',
      type: 'textarea',
      label: 'Supporting Text',
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      labels: {
        singular: 'Testimonial',
        plural: 'Testimonials',
      },
      required: true,
      minRows: 2,
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          label: 'Quote',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'authorName',
              type: 'text',
              label: 'Author Name',
              required: true,
            },
            {
              name: 'authorRole',
              type: 'text',
              label: 'Author Role',
            },
          ],
        },
        {
          name: 'company',
          type: 'text',
          label: 'Company',
        },
      ],
    },
  ],
}

