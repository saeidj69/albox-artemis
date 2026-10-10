import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/utils/test-utils'

import type { CheckBasket200 } from '@/api/models'

import { server } from '../../../../vitest.setup'
import type { ProductBasketLine } from '../types'
import { useBasketCheckCall } from './use-basket-check-call'

const clearBasket = vi.fn()

let mockLocation: { latitude: number; longitude: number } = {
  latitude: 35.7,
  longitude: 51.4,
}
let mockIsLocationLoading = false
let mockProductLines: ProductBasketLine[] = []
let mockSelectedTimeSlotId: number | null = null

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({
    location: mockLocation,
    source: 'FALLBACK',
    address: null,
    isLoading: mockIsLocationLoading,
  }),
}))

vi.mock('./use-basket', () => ({
  useBasket: () => ({
    productLines: mockProductLines,
    clear: clearBasket,
  }),
}))

vi.mock('./use-checkout-data', () => ({
  useCheckoutData: () => ({
    checkout: { selectedTimeSlotId: mockSelectedTimeSlotId },
  }),
}))

const okResponse: CheckBasket200 = {
  basket: {
    isOk: true,
    products: [
      {
        productId: 1,
        quantity: 2,
        status: 'ok',
        errorMessages: [],
        details: {
          name: 'Product',
          maxPurchaseQuantity: 10,
          isOutOfStock: false,
          boxRetailPrice: 100000,
          netPrice: 100000,
          discountPercentage: 0,
          cashbackPercentage: 0,
          cashbackAmount: 0,
          unitInBox: 1,
          images: [],
        },
      },
    ],
    totalProductsPriceWithoutDiscount: 200000,
    deliveryFeeWithoutDiscount: null,
    deliveryFeeDiscount: null,
    netDeliveryFee: null,
    totalProductsDiscount: 0,
    totalDiscountAmount: 0,
    totalCashbackAmount: 0,
    totalPrice: 200000,
    timeslotOptions: [],
    appliedRules: [],
  },
}

describe('useBasketCheckCall', () => {
  beforeEach(() => {
    clearBasket.mockReset()
    mockLocation = { latitude: 35.7, longitude: 51.4 }
    mockIsLocationLoading = false
    mockProductLines = [
      {
        type: 'product',
        productId: 1,
        quantity: 2,
        title: 'Product',
        priceWhenAdded: 100000,
        addedAt: 1,
      },
    ]
    mockSelectedTimeSlotId = null
  })

  it('is a no-op when location is still loading', async () => {
    mockIsLocationLoading = true
    let requestCount = 0

    server.use(
      http.post('*/order/basket/check', () => {
        requestCount += 1
        return HttpResponse.json(okResponse)
      }),
    )

    const { result } = renderHook(() => useBasketCheckCall())

    act(() => {
      result.current.call()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(requestCount).toBe(0)
    expect(result.current.data).toBeNull()
    expect(result.current.isChecking).toBe(false)
  })

  it('clears snapshot and isChecking when productLines is empty', () => {
    mockProductLines = []
    let requestCount = 0

    server.use(
      http.post('*/order/basket/check', () => {
        requestCount += 1
        return HttpResponse.json(okResponse)
      }),
    )

    const { result } = renderHook(() => useBasketCheckCall())

    act(() => {
      result.current.call()
    })

    expect(requestCount).toBe(0)
    expect(result.current.data).toBeNull()
    expect(result.current.isChecking).toBe(false)
  })

  it('posts mapped products and stores the response on success', async () => {
    mockSelectedTimeSlotId = 42
    let capturedBody: unknown

    server.use(
      http.post('*/order/basket/check', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(okResponse)
      }),
    )

    const { result } = renderHook(() => useBasketCheckCall())

    act(() => {
      result.current.call()
    })

    expect(result.current.isChecking).toBe(true)

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    expect(capturedBody).toEqual({
      latitude: 35.7,
      longitude: 51.4,
      products: [{ id: 1, quantity: 2 }],
      timeslotId: 42,
    })
    expect(result.current.data).toEqual(okResponse)
  })

  it('omits timeslotId when none is selected', async () => {
    mockSelectedTimeSlotId = null
    let capturedBody: Record<string, unknown> | undefined

    server.use(
      http.post('*/order/basket/check', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(okResponse)
      }),
    )

    const { result } = renderHook(() => useBasketCheckCall())

    act(() => {
      result.current.call()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(okResponse)
    })

    expect(capturedBody).toMatchObject({
      products: [{ id: 1, quantity: 2 }],
    })
    expect(capturedBody?.timeslotId).toBeUndefined()
  })

  it('clear() clears basket, snapshot, and isChecking', async () => {
    server.use(
      http.post('*/order/basket/check', () => HttpResponse.json(okResponse)),
    )

    const { result } = renderHook(() => useBasketCheckCall())

    act(() => {
      result.current.call()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(okResponse)
    })

    act(() => {
      result.current.clear()
    })

    expect(clearBasket).toHaveBeenCalledTimes(1)
    expect(result.current.data).toBeNull()
    expect(result.current.isChecking).toBe(false)
  })
})
