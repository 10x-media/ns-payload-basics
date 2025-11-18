import type Stripe from 'stripe'
import type { BasePayload } from 'payload'

export async function handleCheckoutSessionCompleted({
  event,
  stripe,
  payload,
}: {
  event: Stripe.Event
  stripe: Stripe
  payload: BasePayload
}) {
  const session = event.data.object as Stripe.Checkout.Session

  // Retrieve full session details with line items
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items'],
  })

  const productSlug = session.metadata?.productSlug
  const productId = session.metadata?.productId

  if (!productId || !productSlug) {
    console.error('Missing product metadata in checkout session')
    return
  }

  // Fetch product details
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
  })

  const lineItems = fullSession.line_items?.data || []
  const firstItem = lineItems[0]
  const quantity = firstItem?.quantity || 1
  const unitPrice = (firstItem?.amount_total || 0) / 100 / quantity
  const subtotal = (firstItem?.amount_total || 0) / 100

  // Create order in Payload
  await payload.create({
    collection: 'orders',
    data: {
      status: 'paid',
      paymentStatus: 'paid',
      customer: {
        name: session.customer_details?.name || 'Customer',
        email: session.customer_details?.email || '',
      },
      shippingAddress: {
        line1: session.shipping_details?.address?.line1 || '',
        city: session.shipping_details?.address?.city || '',
        country: session.shipping_details?.address?.country || '',
        postalCode: session.shipping_details?.address?.postal_code || '',
      },
      lineItems: [
        {
          product: productId,
          productSnapshot: {
            name: product.name || '',
            price: product.price || 0,
            currency: 'USD',
          },
          quantity,
          unitPrice,
          subtotal,
        },
      ],
      subtotal,
      total: subtotal,
    } as any,
  })

  console.log(`Order created for checkout session ${session.id}`)
}
