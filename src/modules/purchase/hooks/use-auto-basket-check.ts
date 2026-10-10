'use client'

import { useEffect } from 'react'

import { useDebouncedValue } from 'rooks'

import { useLocation } from '@/modules/addresses/hooks'

import { useBasket } from './use-basket'
import { useBasketCheckCall } from './use-basket-check-call'
import { useCheckoutData } from './use-checkout-data'

const DEBOUNCE_MS = 300

/**
 * Opt-in page-level auto-check. Debounces product-line changes, waits for
 * location, then calls `useBasketCheckCall`. Also re-runs when the selected
 * timeslot changes so checkout prices stay in sync. Leaf consumers of
 * `useBasketCheckCall` must not also fire this, or requests duplicate.
 */
export function useAutoBasketCheck() {
  const { productLines } = useBasket()
  const { isLoading: isLocationLoading } = useLocation()
  const { checkout } = useCheckoutData()
  const { call } = useBasketCheckCall()
  const [debouncedProductLines] = useDebouncedValue(productLines, DEBOUNCE_MS)

  useEffect(() => {
    if (isLocationLoading) return

    call()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- call identity tracks productLines; debounce is the trigger
  }, [debouncedProductLines, isLocationLoading, checkout.selectedTimeSlotId])
}
