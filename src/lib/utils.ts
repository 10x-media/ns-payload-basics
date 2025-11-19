import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { generateSignedToken } from './signedToken'
import { stringify } from 'qs-esm'

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

export const generatePreviewPath = ({
  pathname,
  withToken = true,
}: {
  pathname: string
  withToken?: boolean
}) => {
  const queryParams: Record<string, string> = {
    pathname,
  }

  if (withToken) {
    const token = generateSignedToken({
      scope: 'preview',
    })
    queryParams.token = token
  }

  return `${process.env.NEXT_PUBLIC_URL}/next/preview?${stringify(queryParams)}`
}
