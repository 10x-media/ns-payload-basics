import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value?: number, currency = 'USD') {
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

export const generatePreviewPath = ({ pathname }: { pathname: string }) => {
  const params = {
    pathname,
    preview: 'true',
  }

  const encodedParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    encodedParams.append(key, value)
  })

  return `${process.env.NEXT_PUBLIC_URL}/next/preview?${encodedParams.toString()}`
}
