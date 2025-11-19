import { PayloadAiPluginLexicalEditorFeature } from '@ai-stack/payloadcms'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig, User } from 'payload'
import { autoAssignVendorHook } from './hooks/autoAssignVendorHook'

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
    create: ({ req: { user } }: { req: { user: User | null } }) => {
      if (!user) return false
      return user.collection === 'vendors'
    },
    update: ({ req: { user } }: { req: { user: User | null } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      if (user.collection === 'vendors') {
        return {
          vendor: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }: { req: { user: User | null } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      if (user.collection === 'vendors') {
        return {
          vendor: {
            equals: user.id,
          },
        }
      }
      return false
    },
  },
  hooks: {
    beforeValidate: [autoAssignVendorHook],
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
      admin: {
        position: 'sidebar',
      },
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
      admin: {
        position: 'sidebar',
      },
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
          name: 'inventory',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'product-images',
      label: 'Featured Image',
    },
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        position: 'sidebar',
      },
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
      ],
    },
  ],
}
