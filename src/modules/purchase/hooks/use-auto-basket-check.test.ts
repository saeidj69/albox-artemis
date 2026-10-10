import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import type { ProductBasketLine } from '../types'
import { useAutoBasketCheck } from './use-auto-basket-check'

const call = vi.fn()

let mockProductLines: ProductBasketLine[] = []
let mockIsLocationLoading = false
let mockSelectedTimeSlotId: number | null = null

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({
    isLoading: mockIsLocationLoading,
  }),
}))

vi.mock('./use-basket', () => ({
  useBasket: () => ({
    productLines: mockProductLines,
  }),
}))

vi.mock('./use-checkout-data', () => ({
  useCheckoutData: () => ({
    checkout: { selectedTimeSlotId: mockSelectedTimeSlotId },
  }),
}))

vi.mock('./use-basket-check-call', () => ({
  useBasketCheckCall: () => ({ call }),
}))

vi.mock('rooks', () => ({
  useDebouncedValue: <T>(value: T) => [value],
}))

const line = (productId: number): ProductBasketLine => ({
  type: 'product',
  productId,
  quantity: 1,
  title: 'Product',
  priceWhenAdded: 100000,
  addedAt: 1,
})

describe('useAutoBasketCheck', () => {
  beforeEach(() => {
    call.mockReset()
    mockProductLines = [line(1)]
    mockIsLocationLoading = false
    mockSelectedTimeSlotId = null
  })

  it('calls check when location is ready', () => {
    renderHook(() => useAutoBasketCheck())

    expect(call).toHaveBeenCalledTimes(1)
  })

  it('does not call while location is still loading', () => {
    mockIsLocationLoading = true

    renderHook(() => useAutoBasketCheck())

    expect(call).not.toHaveBeenCalled()
  })

  it('calls again when debounced product lines change', () => {
    const { rerender } = renderHook(() => useAutoBasketCheck())

    expect(call).toHaveBeenCalledTimes(1)

    mockProductLines = [line(1), line(2)]
    rerender()

    expect(call).toHaveBeenCalledTimes(2)
  })

  it('calls again when the selected timeslot changes', () => {
    const { rerender } = renderHook(() => useAutoBasketCheck())

    expect(call).toHaveBeenCalledTimes(1)

    mockSelectedTimeSlotId = 42
    rerender()

    expect(call).toHaveBeenCalledTimes(2)
  })

  it('calls once location finishes loading', () => {
    mockIsLocationLoading = true
    const { rerender } = renderHook(() => useAutoBasketCheck())

    expect(call).not.toHaveBeenCalled()

    mockIsLocationLoading = false
    rerender()

    expect(call).toHaveBeenCalledTimes(1)
  })
})
