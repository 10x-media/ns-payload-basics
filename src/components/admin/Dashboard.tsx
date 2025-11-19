'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface Stats {
  orders: { total: number; paid: number; pending: number }
  products: { total: number; active: number }
  users: { total: number }
  revenue: { total: number }
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    orders: { total: 0, paid: 0, pending: 0 },
    products: { total: 0, active: 0 },
    users: { total: 0 },
    revenue: { total: 0 },
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes, paidOrdersRes] = await Promise.all([
          fetch('/api/orders?limit=0'),
          fetch('/api/products?limit=0'),
          fetch('/api/users?limit=0'),
          fetch('/api/orders?limit=1000&where[paymentStatus][equals]=paid'),
        ])

        const [orders, products, users, paidOrders] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
          usersRes.json(),
          paidOrdersRes.json(),
        ])

        const revenue = (paidOrders?.docs || []).reduce((sum: number, order: any) => sum + (order.total || 0), 0)

        setStats({
          orders: {
            total: orders?.totalDocs || 0,
            paid: (orders?.docs || []).filter((o: any) => o.paymentStatus === 'paid').length,
            pending: (orders?.docs || []).filter((o: any) => o.paymentStatus === 'unpaid').length,
          },
          products: {
            total: products?.totalDocs || 0,
            active: (products?.docs || []).filter((p: any) => p.status === 'active').length,
          },
          users: { total: users?.totalDocs || 0 },
          revenue: { total: revenue },
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.orders.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.orders.paid} paid, {stats.orders.pending} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${stats.revenue.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">From paid orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.products.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.products.active} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.users.total}</p>
        </CardContent>
      </Card>
    </div>
  )
}

