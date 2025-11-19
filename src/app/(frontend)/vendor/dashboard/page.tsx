'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getVendorMe, vendorLogout } from '@/lib/vendor-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product, Vendor } from '@/payload-types'

export default function VendorDashboardPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const vendorData = await getVendorMe()
        if (!vendorData) {
          router.push('/vendor/login')
          return
        }
        setVendor(vendorData.user)

        // Fetch products for this vendor
        const response = await fetch(`/api/products?where[vendor][equals]=${vendorData.user.id}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setProducts(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        router.push('/vendor/login')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handleLogout = async () => {
    try {
      await vendorLogout()
      router.push('/vendor/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!vendor) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome, {vendor.name}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/vendor/products/new">Add Product</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">You don't have any products yet.</p>
              <Button asChild>
                <Link href="/vendor/products/new">Create Your First Product</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description || 'No description'}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            Price: ${product.price?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-muted-foreground">
                            Inventory: {product.inventory || 0}
                          </span>
                          <span className="text-muted-foreground">
                            Status: {product.status || 'draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/vendor/products/${product.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
