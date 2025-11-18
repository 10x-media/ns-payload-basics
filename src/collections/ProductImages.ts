import type { CollectionConfig } from 'payload'

export const ProductImages: CollectionConfig = {
  slug: 'product-images',
  labels: {
    singular: 'Product Image',
    plural: 'Product Images',
  },
  admin: {
    group: 'Shop',
    defaultColumns: ['filename', 'product', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Associated Product',
      required: false,
    },
    {
      name: 'position',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
    },
  ],
}
