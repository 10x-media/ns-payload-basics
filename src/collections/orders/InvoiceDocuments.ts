import type { CollectionConfig } from 'payload'

export const InvoiceDocuments: CollectionConfig = {
  slug: 'invoice-documents',
  labels: {
    singular: 'Invoice Document',
    plural: 'Invoice Documents',
  },
  upload: true,
  admin: {
    group: 'Shop',
  },
  fields: [],
}
