import { Order } from '@/payload-types'

const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`

export function generateOrderNumberHook({ data }: { data: Order }) {
  if (!data?.orderNumber) {
    data.orderNumber = generateOrderNumber()
  }
  return data
}
