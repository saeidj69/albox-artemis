import { describe, expect, it } from 'vitest'

import { act, renderHook } from '@/utils/test-utils'

import { PaymentPaymentMethod } from '@/api/models'

import { useCheckoutData } from './use-checkout-data'

describe('useCheckoutData', () => {
  it('initializes with default checkout state', () => {
    const { result } = renderHook(() => useCheckoutData())
    expect(result.current.checkout).toEqual({
      selectedTimeSlotId: null,
      selectedPaymentMethod: null,
      walletUsage: false,
      comment: '',
    })
  })

  it('updates comment with setComment', () => {
    const { result } = renderHook(() => useCheckoutData())

    act(() => {
      result.current.setComment('Call on arrival')
    })

    expect(result.current.checkout.comment).toBe('Call on arrival')
  })

  it('updates selected payment method with setSelectedPaymentMethod', () => {
    const { result } = renderHook(() => useCheckoutData())

    act(() => {
      result.current.setSelectedPaymentMethod(PaymentPaymentMethod.cod)
    })

    expect(result.current.checkout.selectedPaymentMethod).toBe(
      PaymentPaymentMethod.cod,
    )
  })

  it('updates wallet usage with setWalletUsage', () => {
    const { result } = renderHook(() => useCheckoutData())

    act(() => {
      result.current.setWalletUsage(true)
    })

    expect(result.current.checkout.walletUsage).toBe(true)
  })

  it('updates selected timeslot id with setSelectedTimeSlotId', () => {
    const { result } = renderHook(() => useCheckoutData())

    act(() => {
      result.current.setSelectedTimeSlotId(42)
    })

    expect(result.current.checkout.selectedTimeSlotId).toBe(42)
  })

  it('resets state to defaults on clear()', () => {
    const { result } = renderHook(() => useCheckoutData())

    act(() => {
      result.current.setComment('Testing')
      result.current.setSelectedTimeSlotId(100)
    })

    act(() => {
      result.current.clear()
    })

    expect(result.current.checkout).toEqual({
      selectedTimeSlotId: null,
      selectedPaymentMethod: null,
      walletUsage: false,
      comment: '',
    })
  })
})
