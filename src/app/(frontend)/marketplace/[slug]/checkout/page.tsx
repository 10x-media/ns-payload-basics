import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import Stripe from 'stripe'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import config from '@/payload.config'
import { formatPrice } from '@/lib/utils'

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

  async function createOrderAndCheckout(formData: FormData) {
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

    // Create the order document first
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

    // Create Stripe checkout session
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) {
      redirect(`/marketplace/${productSlug}/checkout?error=stripe_not_configured`)
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2022-08-01' })
    const origin = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const unitPrice = fetched.price ?? 0
    const amount = Math.round(unitPrice * 100)

    if (!amount || amount <= 0) {
      redirect(`/marketplace/${productSlug}/checkout?error=invalid_price`)
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: (fetched.currency ?? 'usd').toLowerCase(),
              product_data: {
                name: fetched.name ?? 'Product',
                description: fetched.description ?? undefined,
              },
              unit_amount: amount,
            },
            quantity,
          },
        ],
        success_url: `${origin}/marketplace/thank-you?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
        cancel_url: `${origin}/marketplace/${productSlug}/checkout`,
        customer_email: email,
        metadata: {
          productSlug,
          productId: fetched.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      })

      if (!session.url) {
        redirect(`/marketplace/${productSlug}/checkout?error=session_creation_failed`)
      }

      redirect(session.url)
    } catch (error) {
      // Re-throw redirect errors as they are expected behavior
      if (
        error &&
        typeof error === 'object' &&
        'digest' in error &&
        typeof error.digest === 'string' &&
        error.digest.startsWith('NEXT_REDIRECT')
      ) {
        throw error
      }
      console.error('Stripe session creation error:', error)
      redirect(`/marketplace/${productSlug}/checkout?error=stripe_error`)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
      <Link
        href={`/marketplace/${product.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to product
      </Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              Confirm product details before checkout.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </div>
              <Badge>{formatPrice(product.price, product.currency ?? 'USD')}</Badge>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd className="text-muted-foreground">
                  {product.status === 'active' ? 'Ready to ship' : 'Preview'}
                </dd>
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
            <p className="text-sm text-muted-foreground">Secure payment powered by Stripe.</p>
          </CardHeader>
          <form action={createOrderAndCheckout}>
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
                Continue to payment
              </Button>
              <p className="text-xs text-muted-foreground">
                You'll be redirected to Stripe's secure checkout page. Your order will be created
                before payment.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
