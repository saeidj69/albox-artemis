import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { OrderOkBasketProduct } from '@/api/models'

import BasketProductCard from './BasketProductCard'

vi.mock('@/modules/purchase/components/add-to-basket', () => ({
  AddToBasketButton: () => <button>تعداد</button>,
}))
vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: vi.fn(),
  }
})

const product: OrderOkBasketProduct = {
  productId: 12,
  quantity: 2,
  status: 'ok',
  errorMessages: [],
  details: {
    name: 'چیپس',
    maxPurchaseQuantity: 10,
    isOutOfStock: false,
    boxRetailPrice: 100000,
    netPrice: 90000,
    discountPercentage: 10,
    cashbackPercentage: 2,
    cashbackAmount: 4000,
    unitInBox: 30,
    images: [],
  },
}
const localProduct = {
  type: 'product' as const,
  productId: 12,
  quantity: 2,
  title: 'چیپس',
  priceWhenAdded: 90000,
  addedAt: 0,
}

describe('Basket product cashback', () => {
  test('shows the checked basket percentage separately from the checkout price', () => {
    render(<BasketProductCard product={product} localProduct={localProduct} />)
    expect(screen.getByText('بازگشت اعتبار')).toBeInTheDocument()
    expect(screen.getByText('٪۲')).toBeInTheDocument()
    expect(screen.getByText('۹٬۰۰۰')).toBeInTheDocument()
  })

  test('updates the badge when basket revalidation changes cashback and hides zero cashback', () => {
    const { rerender } = render(
      <BasketProductCard product={product} localProduct={localProduct} />,
    )
    rerender(
      <BasketProductCard
        product={{
          ...product,
          details: { ...product.details, cashbackPercentage: 5 },
        }}
        localProduct={localProduct}
      />,
    )
    expect(screen.getByText('٪۵')).toBeInTheDocument()
    rerender(
      <BasketProductCard
        product={{
          ...product,
          details: {
            ...product.details,
            cashbackPercentage: 0,
            cashbackAmount: 0,
          },
        }}
        localProduct={localProduct}
      />,
    )
    expect(screen.queryByText('بازگشت اعتبار')).not.toBeInTheDocument()
  })

  test('does not advertise cashback for an unavailable product', () => {
    render(
      <BasketProductCard
        product={{
          ...product,
          status: 'error',
          errorMessages: ['ناموجود'],
          details: {
            ...product.details,
            maxPurchaseQuantity: 0,
            isOutOfStock: true,
          },
        }}
        localProduct={localProduct}
      />,
    )
    expect(screen.queryByText('بازگشت اعتبار')).not.toBeInTheDocument()
  })
})
