'use client'

import { useCallback } from 'react'

import { useAtom } from 'jotai'

import { useLocation } from '@/modules/addresses/hooks'

import { useCheckBasket } from '@/api/functions/basket'

import { basketCheckLoadingAtom, basketCheckSnapshotAtom } from '../atoms'
import { useBasket } from './use-basket'
import { useCheckoutData } from './use-checkout-data'

/**
 * Sends the current basket lines to the check-basket API whenever they
 * change, and returns the latest response — usable from any component
 * that needs server-validated price/availability, not just one page.
 * Keeps a shared `snapshot` of the last success so UI can stay mounted
 * while a re-check is in flight. Exposes `call` for manual re-checks.
 */
export function useBasketCheckCall() {
  const { location, isLoading: isLocationLoading } = useLocation()
  const { productLines, clear: clearBasket } = useBasket()
  const { checkout } = useCheckoutData()

  const selectedTimeslotId = checkout.selectedTimeSlotId

  const [snapshot, setSnapshot] = useAtom(basketCheckSnapshotAtom)
  const [isChecking, setIsChecking] = useAtom(basketCheckLoadingAtom)

  const { mutate: checkBasket } = useCheckBasket()

  const call = useCallback(() => {
    if (isLocationLoading) return

    if (productLines.length === 0) {
      setSnapshot(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)

    checkBasket(
      {
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          products: productLines.map((product) => ({
            id: product.productId,
            quantity: product.quantity,
          })),
          timeslotId: selectedTimeslotId ?? undefined,
        },
      },
      {
        onSuccess: (data) => setSnapshot(data),
        onSettled: () => setIsChecking(false),
      },
    )
  }, [
    location,
    productLines,
    checkBasket,
    setSnapshot,
    setIsChecking,
    selectedTimeslotId,
    isLocationLoading,
  ])

  const clear = useCallback(() => {
    clearBasket()
    setSnapshot(null)
    setIsChecking(false)
  }, [clearBasket, setSnapshot, setIsChecking])

  return { data: snapshot, isChecking, call, clear }
}
