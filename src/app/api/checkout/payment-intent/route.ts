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
    const amount = Math.round(unitPrice * 100 * quantity)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid product price.' }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: (product.currency ?? 'USD').toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        productSlug,
        quantity: String(quantity),
        productId: product.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to create payment intent.' }, { status: 500 })
  }
}
