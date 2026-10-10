import type { OrderSimplifiedOrderStatus } from '@/api/models'

export type OrderStatusTone = 'success' | 'error' | 'info' | 'warning'

const statusTone: Record<OrderSimplifiedOrderStatus, OrderStatusTone> = {
  delivered: 'success',
  canceled: 'error',
  delivering: 'info',
  processing: 'info',
  pending_approval: 'info',
  pending_customer_approval: 'warning',
  pending_payment: 'warning',
}

const toneClassNames: Record<
  OrderStatusTone,
  { root: string; content: string }
> = {
  success: {
    root: 'bg-success-light border-transparent',
    content: 'text-success-dark',
  },
  error: {
    root: 'bg-error-lighter border-transparent',
    content: 'text-error-dark',
  },
  info: {
    root: 'bg-info-light border-transparent',
    content: 'text-info-dark',
  },
  warning: {
    root: 'bg-warning-light border-transparent',
    content: 'text-warning-dark',
  },
}

export const getOrderStatusTone = (status: OrderSimplifiedOrderStatus) =>
  statusTone[status]

export const getOrderStatusChipClassNames = (
  status: OrderSimplifiedOrderStatus,
) => toneClassNames[getOrderStatusTone(status)]
