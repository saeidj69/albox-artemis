import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook, act } from '@/utils/test-utils'

import type {
  OrderNotFoundBasketProduct,
  OrderNotOkBasketProduct,
  OrderOkBasketProduct,
} from '@/api/models'

import type { ProductBasketLine } from '../types'
import { useBasketAlerts } from './use-basket-alerts'

const setQuantity = vi.fn()
const remove = vi.fn()

let mockProductLines: ProductBasketLine[] = []
let mockCheckData: { basket: { products: unknown[] } } | null = null

vi.mock('./use-basket', () => ({
  useBasket: () => ({
    productLines: mockProductLines,
    setQuantity,
    remove,
  }),
}))

vi.mock('./use-basket-check-call', () => ({
  useBasketCheckCall: () => ({
    data: mockCheckData,
  }),
}))

const localProduct = (
  overrides: Partial<ProductBasketLine> = {},
): ProductBasketLine => ({
  type: 'product',
  productId: overrides.productId ?? 1,
  quantity: overrides.quantity ?? 2,
  title: overrides.title ?? 'Product',
  priceWhenAdded: overrides.priceWhenAdded ?? 100_000,
  addedAt: overrides.addedAt ?? 1,
})

const okDetails = (netPrice: number, maxPurchaseQuantity = 10) => ({
  name: 'Product',
  maxPurchaseQuantity,
  isOutOfStock: false,
  boxRetailPrice: netPrice,
  netPrice,
  discountPercentage: 0,
  cashbackPercentage: 0,
  cashbackAmount: 0,
  unitInBox: 1,
  images: [],
})

describe('useBasketAlerts', () => {
  beforeEach(() => {
    setQuantity.mockReset()
    remove.mockReset()
    mockProductLines = [localProduct()]
    mockCheckData = null
  })

  it('marks not_found as not_purchasable with removal error alert', () => {
    const product: OrderNotFoundBasketProduct = {
      productId: 1,
      quantity: 2,
      status: 'not_found',
      errorMessages: [],
      details: null,
    }
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].issueKind).toBe('not_purchasable')
    expect(result.current.items[0].alerts).toEqual([
      {
        severity: 'error',
        text: 'این محصول به صورت خودکار از سبد خرید شما حذف می‌شود.',
      },
    ])
    expect(result.current.items[0].proposedChange).toBeNull()
    expect(result.current.hasError).toBe(true)
  })

  it('emits a warning alert when price increases', () => {
    const product: OrderOkBasketProduct = {
      productId: 1,
      quantity: 2,
      status: 'ok',
      errorMessages: [],
      details: okDetails(120_000),
    }
    mockProductLines = [localProduct({ priceWhenAdded: 100_000 })]
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())
    const item = result.current.items[0]

    expect(item.issueKind).toBe('price_change')
    expect(item.alerts).toEqual([
      {
        text: 'قیمت این محصول ۲٬۰۰۰ تومان افزایش یافت.',
        severity: 'warning',
      },
    ])
    expect(result.current.hasError).toBe(false)
  })

  it('emits a success alert when price decreases', () => {
    const product: OrderOkBasketProduct = {
      productId: 1,
      quantity: 2,
      status: 'ok',
      errorMessages: [],
      details: okDetails(80_000),
    }
    mockProductLines = [localProduct({ priceWhenAdded: 100_000 })]
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())
    const item = result.current.items[0]

    expect(item.issueKind).toBe('price_change')
    expect(item.alerts).toEqual([
      {
        text: 'قیمت این محصول ۲٬۰۰۰ تومان کاهش یافت.',
        severity: 'success',
      },
    ])
  })

  it('marks out_of_stock and clears alerts when maxPurchaseQuantity is 0', () => {
    const product: OrderNotOkBasketProduct = {
      productId: 1,
      quantity: 2,
      status: 'error',
      errorMessages: ['should be ignored by early return'],
      details: {
        name: 'Product',
        maxPurchaseQuantity: 0,
        isOutOfStock: true,
        boxRetailPrice: 100_000,
        netPrice: 100_000,
        discountPercentage: 0,
        cashbackPercentage: 0,
        cashbackAmount: 0,
        unitInBox: 1,
        images: [],
      },
    }
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())
    const item = result.current.items[0]

    expect(item.issueKind).toBe('out_of_stock')
    expect(item.alerts).toEqual([
      {
        text: 'این محصول به صورت خودکار از سبد خرید شما حذف می‌شود.',
        severity: 'error',
      },
    ])
    expect(item.proposedChange).toBeNull()
    expect(result.current.hasError).toBe(true)
  })

  it('caps quantity and proposes a change when local qty exceeds max', () => {
    const product: OrderNotOkBasketProduct = {
      productId: 1,
      quantity: 5,
      status: 'error',
      errorMessages: [],
      details: {
        name: 'Product',
        maxPurchaseQuantity: 3,
        isOutOfStock: false,
        boxRetailPrice: 100_000,
        netPrice: 100_000,
        discountPercentage: 0,
        cashbackPercentage: 0,
        cashbackAmount: 0,
        unitInBox: 1,
        images: [],
      },
    }
    mockProductLines = [localProduct({ quantity: 5, priceWhenAdded: 100_000 })]
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())
    const item = result.current.items[0]

    expect(item.issueKind).toBe('quantity_cap')
    expect(item.alerts).toEqual([
      {
        text: 'تعداد قابل خرید این محصول برای شما ۳ کارتن است.',
        severity: 'warning',
      },
    ])
    expect(item.proposedChange).toEqual({
      ...mockProductLines[0],
      quantity: 3,
    })
  })

  it('maps errorMessages to error alerts and sets hasError', () => {
    const product: OrderOkBasketProduct = {
      productId: 1,
      quantity: 2,
      status: 'ok',
      errorMessages: ['موجودی کافی نیست', ''],
      details: okDetails(100_000),
    }
    mockCheckData = { basket: { products: [product] } }

    const { result } = renderHook(() => useBasketAlerts())

    expect(result.current.items[0].alerts).toEqual([
      { text: 'موجودی کافی نیست', severity: 'error' },
    ])
    expect(result.current.hasError).toBe(true)
  })

  it('filters out check products with no matching local line', () => {
    mockProductLines = [localProduct({ productId: 1 })]
    mockCheckData = {
      basket: {
        products: [
          {
            productId: 99,
            quantity: 1,
            status: 'ok',
            errorMessages: [],
            details: okDetails(100_000),
          },
        ],
      },
    }

    const { result } = renderHook(() => useBasketAlerts())
    expect(result.current.items).toEqual([])
  })

  it('applyProposedChanges caps qty, removes unfixable items, skips price_change', () => {
    const cappedLocal = localProduct({ productId: 1, quantity: 5 })
    const notFoundLocal = localProduct({ productId: 2 })
    const outOfStockLocal = localProduct({ productId: 3 })
    const priceChangeLocal = localProduct({
      productId: 4,
      priceWhenAdded: 100_000,
    })

    mockProductLines = [
      cappedLocal,
      notFoundLocal,
      outOfStockLocal,
      priceChangeLocal,
    ]
    mockCheckData = {
      basket: {
        products: [
          {
            productId: 1,
            quantity: 5,
            status: 'error',
            errorMessages: [],
            details: {
              name: 'A',
              maxPurchaseQuantity: 2,
              isOutOfStock: false,
              boxRetailPrice: 100_000,
              netPrice: 100_000,
              discountPercentage: 0,
              cashbackPercentage: 0,
              cashbackAmount: 0,
              unitInBox: 1,
              images: [],
            },
          } satisfies OrderNotOkBasketProduct,
          {
            productId: 2,
            quantity: 1,
            status: 'not_found',
            errorMessages: [],
            details: null,
          } satisfies OrderNotFoundBasketProduct,
          {
            productId: 3,
            quantity: 1,
            status: 'error',
            errorMessages: [],
            details: {
              name: 'C',
              maxPurchaseQuantity: 0,
              isOutOfStock: true,
              boxRetailPrice: 100_000,
              netPrice: 100_000,
              discountPercentage: 0,
              cashbackPercentage: 0,
              cashbackAmount: 0,
              unitInBox: 1,
              images: [],
            },
          } satisfies OrderNotOkBasketProduct,
          {
            productId: 4,
            quantity: 1,
            status: 'ok',
            errorMessages: [],
            details: okDetails(120_000),
          } satisfies OrderOkBasketProduct,
        ],
      },
    }

    const { result } = renderHook(() => useBasketAlerts())

    act(() => {
      result.current.applyProposedChanges()
    })

    expect(setQuantity).toHaveBeenCalledWith('product', 1, 2)
    expect(remove).toHaveBeenCalledWith('product', 2)
    expect(remove).toHaveBeenCalledWith('product', 3)
    expect(setQuantity).not.toHaveBeenCalledWith(
      'product',
      4,
      expect.anything(),
    )
    expect(remove).not.toHaveBeenCalledWith('product', 4)
  })
})
