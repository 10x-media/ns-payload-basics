import { getPayload } from 'payload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import config from '@/payload.config'
import type { Order, Product } from '@/payload-types'

interface TopProduct {
  id: string
  name: string
  revenue: number
  quantitySold: number
  inventory: number
}

export const Dashboard = async () => {
  const payload = await getPayload({ config: await config })

  // Fetch all data in parallel
  const [ordersResult, productsResult, usersResult, vendorsResult] = await Promise.all([
    payload.find({
      collection: 'orders',
      limit: 0,
      depth: 1,
    }),
    payload.find({
      collection: 'products',
      limit: 0,
    }),
    payload.find({
      collection: 'users',
      limit: 0,
    }),
    payload.find({
      collection: 'vendors',
      limit: 0,
    }),
  ])

  const orders = ordersResult.docs as Order[]
  const products = productsResult.docs as Product[]

  // Calculate basic stats
  const totalOrders = orders.length
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'unpaid')
  const shippedOrders = orders.filter((o) => o.status === 'shipped')
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled')

  const revenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const averageOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === 'active')
  const draftProducts = products.filter((p) => p.status === 'draft')
  const archivedProducts = products.filter((p) => p.status === 'archived')

  // Calculate stock statistics
  const totalInventory = products.reduce((sum, p) => sum + (p.inventory || 0), 0)
  const lowStockProducts = products.filter((p) => (p.inventory || 0) > 0 && (p.inventory || 0) < 10)
  const outOfStockProducts = products.filter((p) => (p.inventory || 0) === 0)

  // Calculate top products by revenue
  const productRevenueMap = new Map<
    string,
    { revenue: number; quantity: number; name: string; inventory: number }
  >()

  paidOrders.forEach((order) => {
    order.lineItems?.forEach((item) => {
      if (item.product && typeof item.product === 'object' && 'id' in item.product) {
        const productId = item.product.id as string
        const quantity = item.quantity || 0
        const subtotal = item.subtotal || 0

        const existing = productRevenueMap.get(productId) || {
          revenue: 0,
          quantity: 0,
          name: (item.productSnapshot?.name as string) || 'Unknown',
          inventory: 0,
        }

        productRevenueMap.set(productId, {
          revenue: existing.revenue + subtotal,
          quantity: existing.quantity + quantity,
          name: existing.name,
          inventory: existing.inventory,
        })
      }
    })
  })

  // Update inventory for top products
  products.forEach((product) => {
    const existing = productRevenueMap.get(product.id)
    if (existing) {
      existing.inventory = product.inventory || 0
      existing.name = product.name
    }
  })

  const topProducts: TopProduct[] = Array.from(productRevenueMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      quantitySold: data.quantity,
      inventory: data.inventory,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Recent orders (last 5)
  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {paidOrders.length} paid, {pendingOrders.length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              $
              {revenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Avg: $
              {averageOrderValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeProducts.length} active, {draftProducts.length} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usersResult.totalDocs}</p>
            <p className="text-sm text-muted-foreground mt-1">{vendorsResult.totalDocs} vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalInventory.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Total inventory units</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Low stock (&lt; 10)</span>
                <span className="font-semibold text-orange-600">{lowStockProducts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Out of stock</span>
                <span className="font-semibold text-red-600">{outOfStockProducts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Paid</span>
                <span className="font-semibold text-green-600">{paidOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-semibold text-yellow-600">{pendingOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipped</span>
                <span className="font-semibold text-blue-600">{shippedOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cancelled</span>
                <span className="font-semibold text-red-600">{cancelledOrders.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active</span>
                <span className="font-semibold text-green-600">{activeProducts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Draft</span>
                <span className="font-semibold text-gray-600">{draftProducts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Archived</span>
                <span className="font-semibold text-gray-600">{archivedProducts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantitySold} sold • Stock: {product.inventory}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      $
                      {product.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{order.orderNumber || order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name} •{' '}
                      {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      $
                      {(order.total || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        order.paymentStatus === 'paid'
                          ? 'text-green-600'
                          : order.paymentStatus === 'unpaid'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
