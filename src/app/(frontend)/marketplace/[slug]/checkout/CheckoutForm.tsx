'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/payload-types'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

type CheckoutActionResult =
  | { error: string }
  | { orderNumber: string }

type CheckoutFormProps = {
  product: Product
  createOrder: (formData: FormData) => Promise<CheckoutActionResult>
}

export function CheckoutForm({ product, createOrder }: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function prepareIntent() {
      setLoadingIntent(true)
      setMessage(null)
      try {
        const response = await fetch('/api/checkout/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: product.slug, quantity }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to prepare payment.')
        }

        if (isMounted) {
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId)
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : 'Unable to prepare payment.')
        }
      } finally {
        if (isMounted) setLoadingIntent(false)
      }
    }

    prepareIntent()
    return () => {
      isMounted = false
    }
  }, [product.slug, quantity])

  const appearance = useMemo(() => ({ theme: 'stripe' as const }), [])

  return (
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
          <p className="text-sm text-muted-foreground">Secure payments are powered by Stripe.</p>
        </CardHeader>
        <CardContent>
          {clientSecret && stripePromise ? (
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutFormInner
                product={product}
                createOrder={createOrder}
                quantity={quantity}
                setQuantity={setQuantity}
                loadingIntent={loadingIntent}
                paymentIntentId={paymentIntentId}
                message={message}
                setMessage={setMessage}
              />
            </Elements>
          ) : (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground">
              {message ?? 'Preparing payment form…'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatPrice(value?: number | null, currency = 'USD') {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

type CheckoutFormInnerProps = {
  product: Product
  quantity: number
  setQuantity: (value: number) => void
  createOrder: (formData: FormData) => Promise<CheckoutActionResult>
  loadingIntent: boolean
  paymentIntentId: string | null
  message: string | null
  setMessage: (value: string | null) => void
}

function CheckoutFormInner({
  product,
  quantity,
  setQuantity,
  createOrder,
  loadingIntent,
  paymentIntentId,
  message,
  setMessage,
}: CheckoutFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements) return
    if (!paymentIntentId) {
      setMessage('Payment is not ready yet. Please try again.')
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    formData.set('quantity', String(quantity))
    formData.set('productSlug', product.slug ?? '')
    formData.set('paymentIntentId', paymentIntentId)

    const result = await createOrder(formData)

    if ('error' in result) {
      setMessage(result.error)
      setIsSubmitting(false)
      return
    }

    const orderNumber = result.orderNumber
    const email = String(formData.get('email') ?? '')
    const name = String(formData.get('name') ?? '')
    const line1 = String(formData.get('line1') ?? '')
    const city = String(formData.get('city') ?? '')
    const country = String(formData.get('country') ?? '')
    const postalCode = String(formData.get('postalCode') ?? '')

    const confirmation = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/marketplace/thank-you?order=${orderNumber}`,
        receipt_email: email,
        shipping: {
          name,
          address: {
            line1,
            city,
            country,
            postal_code: postalCode,
          },
        },
      },
      redirect: 'if_required',
    })

    if (confirmation.error) {
      setMessage(confirmation.error.message ?? 'Unable to complete payment.')
      setIsSubmitting(false)
      return
    }

    router.push(`/marketplace/thank-you?order=${orderNumber}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          name="quantityInput"
          min={1}
          value={quantity}
          onChange={(event) => {
            const nextValue = Number(event.target.value)
            setQuantity(Number.isFinite(nextValue) && nextValue > 0 ? Math.floor(nextValue) : 1)
          }}
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

      <div className="rounded-lg border border-input p-4">
        <PaymentElement />
      </div>

      {message && <p className="text-sm text-destructive">{message}</p>}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full"
          disabled={!stripe || !elements || loadingIntent || isSubmitting}
        >
          {isSubmitting ? 'Processing…' : 'Pay now'}
        </Button>
        <p className="text-xs text-muted-foreground">
          By submitting, we will store your order inside the Payload <code>orders</code> collection for fulfillment.
        </p>
      </div>
    </form>
  )
}


