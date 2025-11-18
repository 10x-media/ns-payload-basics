import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product, ProductImage } from '@/payload-types'
import config from '@/payload.config'

type SearchParams = Promise<{ search?: string | string[] }>

type MarketplaceProduct = {
  id: string
  name: string
  slug: string
  price: number
  currency?: string | null
  shortDescription?: string | null
  status?: Product['status']
  imageUrl?: string | null
}

const FALLBACK_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'placeholder-1',
    name: 'Artisan Desk Lamp',
    slug: 'artisan-desk-lamp',
    price: 129,
    currency: 'USD',
    shortDescription: 'Hand-blown glass shade, walnut base, and dimmable controls.',
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'placeholder-2',
    name: 'Ceramic Pour-Over Kit',
    slug: 'ceramic-pour-over-kit',
    price: 89,
    currency: 'USD',
    shortDescription: 'Barista-grade brewing ritual crafted by small kilns.',
    imageUrl: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'placeholder-3',
    name: 'Modular Standing Desk',
    slug: 'modular-standing-desk',
    price: 1380,
    currency: 'USD',
    shortDescription: 'Powder-coated frame with cable channel and oak desktop.',
    imageUrl: 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=1200&q=80',
  },
]

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams
  const search = parseSearch(resolvedParams?.search)

  const payloadClient = await getPayload({ config: await config })
  const productsResponse = await payloadClient
    .find({
      collection: 'products',
      depth: 2,
      limit: 24,
      where: buildSearchClause(search),
      sort: '-updatedAt',
    })
    .catch(() => null)

  const products =
    productsResponse?.docs?.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price ?? 0,
      currency: product.currency ?? 'USD',
      shortDescription: product.shortDescription,
      status: product.status,
      imageUrl: resolveProductImage(product),
    })) ?? FALLBACK_PRODUCTS

  const hasResults = productsResponse?.docs && productsResponse.docs.length > 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="space-y-4 text-center">
        <Badge variant="secondary" className="uppercase tracking-widest">
          Marketplace
        </Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Curated products built by independent vendors</h1>
          <p className="text-muted-foreground">
            Discover in-stock inventory from vetted makers. Search by product name, tag, or story.
          </p>
        </div>
        <form className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl border bg-card/50 p-4 shadow-sm sm:flex-row">
          <label className="sr-only" htmlFor="search">
            Search catalog
          </label>
          <input
            id="search"
            name="search"
            placeholder="Search by product or vendor"
            defaultValue={search}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>
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
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
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
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{formatPrice(product.price, product.currency)}</p>
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

function parseSearch(search?: string | string[]) {
  if (!search) return ''
  return Array.isArray(search) ? search[0] ?? '' : search
}

function buildSearchClause(search: string) {
  if (!search) return undefined

  return {
    or: [
      {
        name: {
          like: search,
        },
      },
      {
        shortDescription: {
          like: search,
        },
      },
      {
        'tags.value': {
          like: search,
        },
      },
    ],
  }
}

function resolveProductImage(product: Product) {
  const featured = product.featuredImage
  if (featured && typeof featured === 'object' && 'url' in featured) {
    return (featured as ProductImage).url
  }

  const galleryItem = product.images?.[0]
  if (galleryItem && typeof galleryItem === 'object' && 'url' in galleryItem) {
    return (galleryItem as ProductImage).url
  }
  return null
}

function formatPrice(value?: number, currency = 'USD') {
  const amount = value ?? 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

