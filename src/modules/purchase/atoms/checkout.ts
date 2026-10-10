import { STORAGE_KEYS } from '@/constants'
import { atomWithStorage } from 'jotai/utils'

import type { OrderOrderPaymentMethod } from '@/api/models'

export type CheckoutState = {
  comment: string
  walletUsage: boolean
  selectedTimeSlotId: number | null
  selectedPaymentMethod: OrderOrderPaymentMethod | null
}

export const DEFAULT_CHECKOUT_STATE: CheckoutState = {
  comment: '',
  walletUsage: false,
  selectedPaymentMethod: null,
  selectedTimeSlotId: null,
}

/** Persisted checkout draft — comment, payment, wallet toggle, timeslot. */
export const checkoutAtom = atomWithStorage<CheckoutState>(
  STORAGE_KEYS.PURCHASE_V3,
  DEFAULT_CHECKOUT_STATE,
  undefined,
  { getOnInit: true },
)
