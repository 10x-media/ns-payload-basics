import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import config from '@payload-config'
import { formatPrice } from '@/lib/utils'

type Params = Promise<{ slug: string }>

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload
    .find({
      collection: 'products',
      depth: 2,
      limit: 1,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            validationStatus: {
              equals: 'checked',
            },
          },
        ],
      },
    })
    .catch(() => null)

  const product = result?.docs?.[0]
  if (!product) {
    notFound()
  }

  console.log(product)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to marketplace
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="aspect-square overflow-hidden rounded-3xl border bg-muted">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image.url}
                alt={product.image.alt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Image coming soon
              </div>
            )}
          </div>
        </section>
        <aside className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {product.status === 'active' ? 'In stock' : 'Preview'}
              </Badge>
              {product.inventory !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {product.inventory} units available
                </span>
              )}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            {product.description && (
              <p className="text-base text-muted-foreground">{product.description}</p>
            )}
            <p className="text-3xl font-semibold">
              {formatPrice(product.price, product.currency ?? 'USD')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href={`/marketplace/${product.slug}/checkout`}>Buy now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/marketplace">Continue browsing</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
