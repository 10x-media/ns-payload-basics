import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/payload-types'
import config from '@/payload.config'

type Params = Promise<{ slug: string }>

export default async function CheckoutPage({ params }: { params: Params }) {
  const { slug } = await params
  const payloadClient = await getPayload({ config: await config })

  const productResponse = await payloadClient
    .find({
      collection: 'products',
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
    })
    .catch(() => null)

  const product = productResponse?.docs?.[0]

  if (!product) {
    redirect('/marketplace?missingProduct=1')
  }

  async function createOrder(formData: FormData) {
    'use server'

    const payloadInstance = await getPayload({ config: await config })
    const quantity = Number(formData.get('quantity') ?? 1)
    const email = String(formData.get('email') ?? '')
    const name = String(formData.get('name') ?? '')
    const line1 = String(formData.get('line1') ?? '')
    const city = String(formData.get('city') ?? '')
    const country = String(formData.get('country') ?? '')
    const postalCode = String(formData.get('postalCode') ?? '')

    const productSlug = String(formData.get('productSlug') ?? '')
    const fetched = await payloadInstance
      .find({
        collection: 'products',
        limit: 1,
        where: { slug: { equals: productSlug } },
      })
      .then((res) => res.docs?.[0])
      .catch(() => null)

    if (!fetched) {
      redirect('/marketplace?missingProduct=1')
    }

    const subtotal = (fetched.price ?? 0) * quantity
    const order = await payloadInstance.create({
      collection: 'orders',
      data: {
        status: 'pending',
        paymentStatus: 'unpaid',
        customer: { name, email },
        shippingAddress: { line1, city, country, postalCode },
        lineItems: [
          {
            product: fetched.id,
            productSnapshot: {
              name: fetched.name,
              price: fetched.price ?? 0,
              currency: fetched.currency ?? 'USD',
            },
            quantity,
            unitPrice: fetched.price ?? 0,
            subtotal,
          },
        ],
        subtotal,
        total: subtotal,
        notes: 'Created via marketplace checkout.',
      },
    })

    redirect(`/marketplace/thank-you?order=${order.orderNumber}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
      <Link href={`/marketplace/${product.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to product
      </Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm product details before checkout.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                {product.shortDescription && <p className="text-sm text-muted-foreground">{product.shortDescription}</p>}
              </div>
              <Badge>{formatPrice(product.price, product.currency ?? 'USD')}</Badge>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd className="text-muted-foreground">{product.status === 'active' ? 'Ready to ship' : 'Preview'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Inventory</dt>
                <dd className="text-muted-foreground">{product.inventory ?? 0} units</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <p className="text-sm text-muted-foreground">No payment gateway yet—this demo just creates an order.</p>
          </CardHeader>
          <form action={createOrder}>
            <input type="hidden" name="productSlug" value={product.slug} />
            <CardContent className="space-y-4">
              <label className="flex flex-col gap-2 text-sm">
                Full name
                <input
                  name="name"
                  required
                  className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Quantity
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  defaultValue={1}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Address line
                <input
                  name="line1"
                  required
                  className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-2 text-sm">
                  City
                  <input
                    name="city"
                    required
                    className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Country
                  <input
                    name="country"
                    required
                    className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Postal code
                  <input
                    name="postalCode"
                    required
                    className="rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Place order
              </Button>
              <p className="text-xs text-muted-foreground">
                By submitting, we will store your order inside the Payload `orders` collection for fulfillment.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

function formatPrice(value?: number | null, currency = 'USD') {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

