// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import type Stripe from 'stripe'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { ProductImages } from './collections/ProductImages'
import { Orders } from './collections/orders/Orders'
import { resendAdapter } from '@payloadcms/email-resend'
import { SiteSettings } from './globals/SiteSettings'
import { s3Storage } from '@payloadcms/storage-s3'
import { payloadAiPlugin } from '@ai-stack/payloadcms'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { Vendors } from './collections/Vendors'
import { stripePlugin } from '@payloadcms/plugin-stripe'
import { InvoiceDocuments } from './collections/orders/InvoiceDocuments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: resendAdapter({
    defaultFromAddress: 'noreply@ns-payload-basics.10xmedia.de',
    defaultFromName: 'Sandro Wegmann',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  collections: [Media, Pages, Products, ProductImages, Orders, Users, Vendors, InvoiceDocuments],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
        'product-images': {
          prefix: 'product-images',
        },
        // 'invoice-documents': {
        //   prefix: 'invoice-documents',
        // },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        // ... Other S3 configuration
      },
    }),
    // payloadAiPlugin({
    //   collections: {
    //     [Products.slug]: true,
    //   },
    //   debugging: false,
    // }),
    mcpPlugin({
      collections: {
        products: {
          enabled: true,
        },
      },
    }),

    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
      webhooks: {
        'checkout.session.completed': async ({ event, payload }) => {
          const session = event.data.object as Stripe.Checkout.Session
          const orderId = session.metadata?.orderId

          if (!orderId) {
            console.error('Missing orderId in checkout session metadata')
            return
          }

          // Update order payment status to paid
          await payload.update({
            collection: 'orders',
            id: orderId,
            data: {
              paymentStatus: 'paid',
              status: 'paid',
            },
          })

          console.log(`Order ${orderId} marked as paid`)
        },
      },
    }),
  ],
})
