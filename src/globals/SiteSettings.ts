import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'CMS',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            {
              name: 'logoText',
              type: 'text',
              label: 'Logo Text',
              required: true,
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Tagline',
            },
            {
              name: 'navLinks',
              type: 'array',
              label: 'Navigation Links',
              labels: {
                singular: 'Link',
                plural: 'Links',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  label: 'URL',
                  required: true,
                },
              ],
            },
            {
              name: 'cta',
              type: 'group',
              label: 'Primary CTA',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                },
                {
                  name: 'href',
                  type: 'text',
                  label: 'URL',
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'headline',
              type: 'text',
              label: 'Headline',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Links',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  label: 'URL',
                  required: true,
                },
              ],
            },
            {
              name: 'legal',
              type: 'array',
              label: 'Legal Links',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  label: 'URL',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
