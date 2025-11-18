import { PayloadAiPluginLexicalEditorFeature } from '@ai-stack/payloadcms'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'inventory', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
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
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          min: 0,
          required: true,
        },
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'USD',
        },
      ],
    },
    {
      name: 'inventory',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'longDescription',
      type: 'richText',
      label: 'Long Description',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            // ... your existing features
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),

            // Please add below
            PayloadAiPluginLexicalEditorFeature(),
          ]
        },
      }),
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'product-images',
      label: 'Featured Image',
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'product-images',
      hasMany: true,
      label: 'Gallery Images',
    },
    {
      name: 'metadata',
      type: 'group',
      label: 'Metadata',
      fields: [
        {
          name: 'sku',
          type: 'text',
        },
        {
          name: 'vendor',
          type: 'text',
        },
      ],
    },
  ],
}
