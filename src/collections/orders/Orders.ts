import type { CollectionConfig } from 'payload'
import { generateOrderNumberHook } from './hooks/generateOrderNumberHook'
import { reduceInventoryHook } from './hooks/reduceInventoryHook'
import { generateInvoiceDocumentHook } from './hooks/generateInvoiceDocumentHook'
import { sendOrderConfirmationEmailHook } from './hooks/sendOrderConfirmationEmailHook'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Order',
    plural: 'Orders',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'customer'],
  },
  access: {
    create: () => true,
  },
  hooks: {
    beforeValidate: [generateOrderNumberHook],
    // beforeChange: [generateInvoiceDocumentHook],
    afterChange: [reduceInventoryHook, sendOrderConfirmationEmailHook],
  },
  fields: [
    {
      name: 'invoice',
      type: 'upload',
      relationTo: 'invoice-documents',
    },
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text', required: true },
            { name: 'city', type: 'text', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'region', type: 'text', label: 'State / Region' },
            { name: 'country', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      labels: {
        singular: 'Line Item',
        plural: 'Line Items',
      },
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'productSnapshot',
          type: 'group',
          label: 'Product Snapshot',
          fields: [
            { name: 'name', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number' },
                { name: 'currency', type: 'text' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              type: 'number',
              required: true,
              min: 1,
              defaultValue: 1,
            },
            {
              name: 'unitPrice',
              type: 'number',
              required: true,
              min: 0,
            },
            {
              name: 'subtotal',
              type: 'number',
              min: 0,
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          min: 0,
          required: true,
        },
        {
          name: 'total',
          type: 'number',
          min: 0,
          required: true,
        },
      ],
    },
  ],
}
