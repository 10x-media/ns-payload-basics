import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import Stripe from 'stripe'

import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const productSlug = String(body?.productSlug ?? '')
    const quantityRaw = Number(body?.quantity ?? 1)
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1

    if (!productSlug) {
      return NextResponse.json({ error: 'Product slug is required.' }, { status: 400 })
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
    }

    const payloadClient = await getPayload({ config: await config })
    const product = await payloadClient
      .find({
        collection: 'products',
        limit: 1,
        where: { slug: { equals: productSlug } },
      })
      .then((res) => res.docs?.[0])
      .catch(() => null)

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    const unitPrice = product.price ?? 0
    const amount = Math.round(unitPrice * 100)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid product price.' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-10-29.clover' })

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name ?? 'Product',
              description: product.description ?? undefined,
            },
            unit_amount: amount,
          },
          quantity,
        },
      ],
      success_url: `${origin}/marketplace/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/marketplace/${productSlug}/checkout`,
      metadata: {
        productSlug,
        productId: product.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 })
  }
}
