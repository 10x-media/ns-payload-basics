import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product, ProductImage } from '@/payload-types'
import config from '@/payload.config'
import { formatPrice } from '@/lib/utils'

export default async function MarketplacePage() {
  const payloadClient = await getPayload({ config: await config })
  const productsResponse = await payloadClient
    .find({
      collection: 'products',
      depth: 2,
      limit: 24,
      sort: '-updatedAt',
    })
    .catch(() => null)

  const products = productsResponse?.docs?.map((product: Product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price ?? 0,
    currency: 'USD',
    description: product.description,
    status: product.status,
    imageUrl: product.image?.url,
  }))

  const hasResults = productsResponse?.docs && productsResponse.docs.length > 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="space-y-4 text-center">
        <Badge variant="secondary" className="uppercase tracking-widest">
          Marketplace
        </Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Curated products built by independent vendors
          </h1>
          <p className="text-muted-foreground">
            Discover in-stock inventory from vetted makers. Search by product name, tag, or story.
          </p>
        </div>
      </header>

      <section>
        {!hasResults && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing sample inventory. Add products in Payload to replace these placeholders.
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="relative h-56 w-full overflow-hidden rounded-t-lg bg-muted">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Image coming soon
                  </div>
                )}
              </div>
              <CardHeader className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  {product.status === 'active' && <Badge>In stock</Badge>}
                  {product.status === 'draft' && <Badge variant="outline">Preview</Badge>}
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {formatPrice(product.price, product.currency)}
                </p>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href={`/marketplace/${product.slug}`}>View details</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/marketplace/${product.slug}/checkout`}>Buy</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
