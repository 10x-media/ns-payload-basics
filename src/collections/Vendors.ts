import { CollectionConfig, User } from 'payload'

export const Vendors: CollectionConfig = {
  slug: 'vendors',
  labels: {
    singular: 'Vendor',
    plural: 'Vendors',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
  },
  auth: true,
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'taxId',
      type: 'text',
      required: true,
      access: {
        read: ({ req: { user } }: { req: { user: User } }) => {
          if (!user) return false
          if (user.collection === 'users') return true
          if (user.collection === 'vendors')
            return {
              id: {
                equals: user.id,
              },
            }
          return false
        },
      },
    },
  ],
}
