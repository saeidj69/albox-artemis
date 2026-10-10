import { useCallback } from 'react'

import { useAtom } from 'jotai'

import type { OrderOrderPaymentMethod } from '@/api/models'

import {
  checkoutAtom,
  DEFAULT_CHECKOUT_STATE,
  type CheckoutState,
} from '../atoms'

export function useCheckoutData() {
  const [checkout, setCheckout] = useAtom(checkoutAtom)

  const patchCheckout = useCallback(
    (patch: Partial<CheckoutState>) => {
      setCheckout((prev) => ({ ...prev, ...patch }))
    },
    [setCheckout],
  )

  const setComment = useCallback(
    (comment: string) => patchCheckout({ comment }),
    [patchCheckout],
  )

  const setSelectedPaymentMethod = useCallback(
    (selectedPaymentMethod: OrderOrderPaymentMethod | null) =>
      patchCheckout({ selectedPaymentMethod }),
    [patchCheckout],
  )

  const setWalletUsage = useCallback(
    (walletUsage: boolean) => patchCheckout({ walletUsage }),
    [patchCheckout],
  )

  const setSelectedTimeSlotId = useCallback(
    (selectedTimeSlotId: number | null) =>
      patchCheckout({ selectedTimeSlotId }),
    [patchCheckout],
  )

  const clear = useCallback(
    () => setCheckout(DEFAULT_CHECKOUT_STATE),
    [setCheckout],
  )

  return {
    checkout,
    setCheckout,
    patchCheckout,
    setComment,
    setSelectedPaymentMethod,
    setWalletUsage,
    setSelectedTimeSlotId,
    clear,
  }
}
