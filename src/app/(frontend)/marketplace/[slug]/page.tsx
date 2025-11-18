import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product, ProductImage } from '@/payload-types'
import config from '@/payload.config'

type Params = Promise<{ slug: string }>

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const payloadClient = await getPayload({ config: await config })

  const result = await payloadClient
    .find({
      collection: 'products',
      depth: 2,
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
    })
    .catch(() => null)

  const product = result?.docs?.[0]
  if (!product) {
    notFound()
  }

  const gallery = extractImages(product)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to marketplace
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="aspect-square overflow-hidden rounded-3xl border bg-muted">
            {gallery.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Image coming soon</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {gallery.slice(1).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt={`${product.name} alt`} className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </section>
        <aside className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{product.status === 'active' ? 'In stock' : 'Preview'}</Badge>
              {product.inventory !== undefined && (
                <span className="text-sm text-muted-foreground">{product.inventory} units available</span>
              )}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-base text-muted-foreground">{product.shortDescription}</p>
            )}
            <p className="text-3xl font-semibold">{formatPrice(product.price, product.currency ?? 'USD')}</p>
          </div>
          {product.longDescription && (
            <Card>
              <CardContent className="prose prose-neutral max-w-none py-6 dark:prose-invert">
                <RichTextRenderer content={product.longDescription} />
              </CardContent>
            </Card>
          )}
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

function extractImages(product: Product) {
  const urls: string[] = []
  if (product.featuredImage && typeof product.featuredImage === 'object' && 'url' in product.featuredImage) {
    urls.push((product.featuredImage as ProductImage).url ?? '')
  }
  product.images?.forEach((image) => {
    if (typeof image === 'object' && 'url' in image && image.url) {
      urls.push(image.url)
    }
  })
  return urls.filter(Boolean)
}

function formatPrice(value?: number | null, currency = 'USD') {
  if (value == null) return '—'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

function RichTextRenderer({ content }: { content: Product['longDescription'] }) {
  if (!content) return null
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {content.root.children?.map((node, index) => {
        if (node.type === 'paragraph') {
          return (
            <p key={index}>
              {node.children?.map((child, childIndex) => (
                <span key={childIndex}>{'text' in child ? child.text : ''}</span>
              ))}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

