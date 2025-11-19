'use client'

import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

export const ExitPreview = () => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setIsLoading] = useState(false)

  const handleExitPreview = useCallback(async () => {
    setIsLoading(true)
    setTimeout(async () => {
      await fetch('/next/exit-preview').then(() => {
        router.refresh()
      })
    }, 100)
  }, [router])

  useEffect(() => {
    // do not render in iframes (live preview)
    try {
      setShow(window.self === window.top)
    } catch (e) {
      setShow(false)
    }
  }, [])

  if (!show) return null
  return (
    <div className={cn('hidden-in-iframe fixed bottom-4 right-4 z-50')}>
      <Button onClick={handleExitPreview} disabled={loading}>
        Preview Mode<span className="mx-1">•</span>Exit
      </Button>
    </div>
  )
}
