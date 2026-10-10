import { EVENTS } from '@/helpers/analytics'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import { useAddToBasket } from './use-add-to-basket'

const add = vi.fn()
const remove = vi.fn()
const setQuantity = vi.fn()
const showSheet = vi.fn()
const toastInfo = vi.fn()
const track = vi.fn()

let mockQuantity = 0

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketEntity: () => ({
    quantity: mockQuantity,
    add,
    remove,
    setQuantity,
  }),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
    hideSheet: vi.fn(),
  }
})

vi.mock('sonner', () => ({
  toast: {
    info: (...args: unknown[]) => toastInfo(...args),
  },
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@bprogress/next', () => ({
  useProgress: () => ({ stop: vi.fn() }),
}))

const mockProduct: ListingProductSummary = {
  id: 101,
  name: 'تست محصول',
  isPromoted: false,
  purchasableQuantity: 5,
  boxDiscountedPrice: 100_000,
  boxRetailPrice: 120_000,
  unitInBox: 1,
  unitRetailPrice: 10_000,
  unitDiscountedPrice: 8_000,
  unitDiscountAmount: 2_000,
  totalDiscount: 15,
  totalDiscountAmount: 20_000,
  totalCashback: 0,
  totalCashbackAmount: 0,
  stepDiscounts: [],
  images: [],
  category: { id: 1, name: 'تست', parentId: null },
  brand: {
    id: 1,
    name: 'تست',
    manufacturer: { id: 1, name: 'تولیدکننده تست' },
  },
}

const mockEvent = {
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
} as unknown as Parameters<ReturnType<typeof useAddToBasket>['onIncrement']>[0]

const mockPointerEvent = {
  pointerType: 'touch',
  button: 0,
  clientX: 0,
  clientY: 0,
} as unknown as Parameters<
  ReturnType<typeof useAddToBasket>['longPressHandlers']['onPointerDown']
>[0]

describe('useAddToBasket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    add.mockReset()
    remove.mockReset()
    setQuantity.mockReset()
    showSheet.mockReset()
    toastInfo.mockReset()
    track.mockReset()
    mockQuantity = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows toast when product cannot be added (purchasableQuantity === 0)', () => {
    const unpurchasable: ListingProductSummary = {
      ...mockProduct,
      purchasableQuantity: 0,
    }
    const { result } = renderHook(() =>
      useAddToBasket({ product: unpurchasable }),
    )

    act(() => {
      result.current.onIncrement(mockEvent)
    })

    expect(toastInfo).toHaveBeenCalledWith('این محصول در حال حاضر موجود نیست.')
    expect(add).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })

  it('shows toast when item is atMax', () => {
    mockQuantity = 5
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct }),
    )

    act(() => {
      result.current.onIncrement(mockEvent)
    })

    expect(toastInfo).toHaveBeenCalledWith(
      expect.stringContaining('حداکثر خرید این کالا'),
    )
    expect(add).not.toHaveBeenCalled()
  })

  it('calls add and emits analytics event when incremented', () => {
    mockQuantity = 2
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct, source: 'PC' }),
    )

    act(() => {
      result.current.onIncrement(mockEvent)
    })

    expect(add).toHaveBeenCalledWith({
      quantity: 1,
      title: 'تست محصول',
      priceWhenAdded: 100_000,
    })
    expect(track).toHaveBeenCalledWith(EVENTS.ADDED_TO_BASKET, {
      plausible: { source: 'product_card' },
    })
    expect(track).toHaveBeenCalledWith(EVENTS.ADD_TO_CART, {
      gtm: {
        ecommerce: {
          currency: 'IRR',
          value: 100_000,
          coupon: '',
          items: [
            {
              item_id: '101',
              item_name: 'تست محصول',
              item_brand: 'تست',
              item_category: 'تست',
              item_variant: 'کارتن ۱ عددی',
              price: 100_000,
              quantity: 1,
              discount: 20_000,
            },
          ],
        },
      },
    })
    expect(track).toHaveBeenCalledWith(EVENTS.BASKET_INITIATED, {
      webengage: true,
    })
  })

  it('reports only the first successful add', () => {
    const onFirstAdd = vi.fn()
    const { result, rerender } = renderHook(() =>
      useAddToBasket({ product: mockProduct, onFirstAdd }),
    )

    act(() => result.current.onIncrement(mockEvent))
    expect(onFirstAdd).toHaveBeenCalledTimes(1)

    mockQuantity = 1
    rerender()
    act(() => result.current.onIncrement(mockEvent))
    expect(onFirstAdd).toHaveBeenCalledTimes(1)
  })

  it('reports a first add confirmed through the quantity picker', () => {
    const onFirstAdd = vi.fn()
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct, onFirstAdd }),
    )

    act(() => result.current.longPressHandlers.onPointerDown(mockPointerEvent))
    act(() => vi.advanceTimersByTime(450))

    const sheetProps = showSheet.mock.calls[0]?.[1] as {
      onConfirm: (quantity: number) => void
    }
    act(() => sheetProps.onConfirm(3))

    expect(setQuantity).toHaveBeenCalledWith(3)
    expect(onFirstAdd).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.BASKET_INITIATED, {
      webengage: true,
    })
  })

  it('does not track basket_initiated when the quantity picker decreases quantity', () => {
    mockQuantity = 3
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct }),
    )

    act(() => result.current.longPressHandlers.onPointerDown(mockPointerEvent))
    act(() => vi.advanceTimersByTime(450))

    const sheetProps = showSheet.mock.calls[0]?.[1] as {
      onConfirm: (quantity: number) => void
    }
    act(() => sheetProps.onConfirm(1))

    expect(setQuantity).toHaveBeenCalledWith(1)
    expect(track).not.toHaveBeenCalledWith(
      EVENTS.BASKET_INITIATED,
      expect.anything(),
    )
  })

  it('decrements quantity when quantity > 1', () => {
    mockQuantity = 3
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct }),
    )

    act(() => {
      result.current.onDecrement(mockEvent)
    })

    expect(setQuantity).toHaveBeenCalledWith(2)
    expect(track).toHaveBeenCalledWith(EVENTS.ADDED_TO_BASKET, {
      plausible: { source: 'product_decreased' },
    })
    expect(track).not.toHaveBeenCalledWith(
      EVENTS.BASKET_INITIATED,
      expect.anything(),
    )
    expect(track).not.toHaveBeenCalledWith(
      EVENTS.REMOVE_FROM_CART,
      expect.anything(),
    )
  })

  it('removes item directly on decrement when quantity === 1 and confirmRemove is false', () => {
    mockQuantity = 1
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct }),
    )

    act(() => {
      result.current.onDecrement(mockEvent)
    })

    expect(remove).toHaveBeenCalledTimes(1)
    expect(showSheet).not.toHaveBeenCalled()
    expect(track).toHaveBeenCalledWith(EVENTS.REMOVE_FROM_CART, {
      gtm: {
        ecommerce: {
          currency: 'IRR',
          value: 100_000,
          items: [
            {
              item_id: '101',
              item_name: 'تست محصول',
              item_brand: 'تست',
              item_category: 'تست',
              item_variant: 'کارتن ۱ عددی',
              price: 100_000,
              quantity: 1,
              discount: 20_000,
            },
          ],
        },
      },
    })
  })

  it('shows ActionSheet on decrement when quantity === 1 and confirmRemove is true', () => {
    mockQuantity = 1
    const { result } = renderHook(() =>
      useAddToBasket({ product: mockProduct, confirmRemove: true }),
    )

    act(() => {
      result.current.onDecrement(mockEvent)
    })

    expect(showSheet).toHaveBeenCalledTimes(1)
    expect(remove).not.toHaveBeenCalled()

    const [, sheetProps] = showSheet.mock.calls[0] as [
      unknown,
      { actions: { id: string; onClick: () => void }[] },
    ]
    const confirmAction = sheetProps.actions.find(
      (action) => action.id === 'confirm',
    )
    act(() => confirmAction?.onClick())

    expect(remove).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(
      EVENTS.REMOVE_FROM_CART,
      expect.objectContaining({
        gtm: expect.objectContaining({
          ecommerce: expect.objectContaining({
            currency: 'IRR',
            items: [expect.objectContaining({ item_id: '101', quantity: 1 })],
          }),
        }),
      }),
    )
  })
})
