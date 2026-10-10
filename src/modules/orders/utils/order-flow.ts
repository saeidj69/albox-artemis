import type {
  OrderOrderPaymentStatus,
  OrderSimplifiedOrderStatus,
} from '@/api/models'

const CORE_FLOW: OrderSimplifiedOrderStatus[] = [
  'pending_approval',
  'processing',
  'delivering',
  'delivered',
]

const PAYMENT_STATUSES_REQUIRING_ONLINE_PAYMENT: OrderOrderPaymentStatus[] = [
  'pending',
  'paid',
  'provisional_paid',
  'expired',
]

const buildFlow = (
  effectiveStatus: OrderSimplifiedOrderStatus,
  paymentStatus: OrderOrderPaymentStatus,
): OrderSimplifiedOrderStatus[] => {
  const flow = [...CORE_FLOW]

  const includesPayment =
    effectiveStatus === 'pending_payment' ||
    PAYMENT_STATUSES_REQUIRING_ONLINE_PAYMENT.includes(paymentStatus)
  if (includesPayment) flow.unshift('pending_payment')

  if (effectiveStatus === 'pending_customer_approval') {
    flow.unshift('pending_customer_approval')
  }

  return flow
}

export const deriveOrderFlow = (
  status: OrderSimplifiedOrderStatus,
  paymentStatus: OrderOrderPaymentStatus,
): OrderSimplifiedOrderStatus[] => {
  if (status === 'canceled') {
    return buildFlow('pending_approval', paymentStatus)
  }
  return buildFlow(status, paymentStatus)
}
