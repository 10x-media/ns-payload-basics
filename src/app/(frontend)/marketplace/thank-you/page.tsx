type SearchParams = Promise<{ order?: string | string[] }>

export default async function ThankYouPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const order = parseOrder(params.order)

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Order received</p>
      <h1 className="text-4xl font-semibold tracking-tight">Thanks for testing the checkout flow.</h1>
      <p className="text-lg text-muted-foreground">
        We just stored the order in Payload. You can view it in the admin dashboard under <code>Orders</code>.
      </p>
      {order && <p className="rounded-full border px-4 py-2 text-sm">Reference: {order}</p>}
      <a href="/marketplace" className="text-sm text-primary underline-offset-4 hover:underline">
        Back to marketplace
      </a>
    </div>
  )
}

function parseOrder(order?: string | string[]) {
  if (!order) return ''
  return Array.isArray(order) ? order[0] : order
}

