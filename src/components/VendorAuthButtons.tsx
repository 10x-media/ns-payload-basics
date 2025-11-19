'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getVendorMe } from '@/lib/vendor-auth'
import { Button } from '@/components/ui/button'
import type { Vendor } from '@/payload-types'

export function VendorAuthButtons() {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const vendorData = await getVendorMe()
        if (vendorData?.user) {
          setVendor(vendorData.user)
        }
      } catch (error) {
        // Not logged in
        setVendor(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return null
  }

  if (vendor) {
    return (
      <Button asChild>
        <Link href="/vendor/dashboard">Dashboard</Link>
      </Button>
    )
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/vendor/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/vendor/signup">Sign Up</Link>
      </Button>
    </>
  )
}

