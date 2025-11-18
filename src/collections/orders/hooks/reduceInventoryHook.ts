import { Order } from '@/payload-types'

export async function reduceInventoryHook({
  doc,
  req,
  operation,
}: {
  doc: Order
  req: any
  operation: 'create' | 'update'
}) {
  if (operation !== 'create') return doc

  const payload = req.payload

  if (!doc?.lineItems) return doc
  for (const lineItem of doc.lineItems) {
    const docs = await payload.find({
      collection: 'products',
      id: lineItem.product?.id || lineItem.product,
    })
    const product = docs?.docs?.[0]
    console.log(product)
    if (!product) continue

    if (product.inventory && product.inventory > 0) {
      product.inventory -= lineItem.quantity
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          inventory: product.inventory,
        },
      })
    }
  }
}
