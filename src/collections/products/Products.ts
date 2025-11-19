import type { CollectionConfig, User } from 'payload'
import { autoAssignVendorHook } from './hooks/autoAssignVendorHook'
import { validateProductWithAIHook } from './hooks/validateProductWithAIHook'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'inventory', 'status', 'validationStatus'],
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
    beforeChange: [validateProductWithAIHook],
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
      name: 'manuallyVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Check this to manually set validation status and disable AI validation.',
      },
    },
    {
      name: 'validationStatus',
      type: 'select',
      required: true,
      defaultValue: 'needs human validation',
      options: [
        { label: 'Blocked', value: 'blocked' },
        { label: 'Checked', value: 'checked' },
        { label: 'Needs Human Validation', value: 'needs human validation' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'AI validation status. Only "checked" products are shown on the marketplace. Enable "Manually Verified" to set this manually without AI override.',
        components: {
          Cell: '/collections/products/cells/ValidationStatusCell#ValidationStatusCell',
        },
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
