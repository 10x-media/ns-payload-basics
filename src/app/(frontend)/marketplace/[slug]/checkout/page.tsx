import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  async function startCheckout(formData: FormData) {
    'use server'

    const productSlug = String(formData.get('productSlug') ?? '')
    const quantity = Number(formData.get('quantity') ?? 1)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/checkout/create-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug, quantity }),
      },
    )

    const data = await response.json()

    if (!response.ok || !data.url) {
      redirect(`/marketplace/${productSlug}/checkout?error=1`)
    }

    redirect(data.url)
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
              <Badge>{formatPrice(product.price)}</Badge>
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
          <form action={startCheckout}>
            <input type="hidden" name="productSlug" value={product.slug} />
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Continue to payment
              </Button>
              <p className="text-xs text-muted-foreground">
                You'll be redirected to Stripe's secure checkout page.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

function formatPrice(value?: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
