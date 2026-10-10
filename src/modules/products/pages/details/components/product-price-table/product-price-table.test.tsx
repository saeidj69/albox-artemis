import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingProduct } from '@/api/models'

import ProductPriceTable from './product-price-table'

const sampleAvailableProduct: ListingProduct = {
  id: 1,
  name: 'تست',
  isPromoted: false,
  purchasableQuantity: 10,
  boxRetailPrice: 120_000,
  boxDiscountedPrice: 100_000,
  unitRetailPrice: 12_000,
  unitDiscountedPrice: 10_000,
  unitDiscountAmount: 2_000,
  totalDiscount: 20_000,
  totalDiscountAmount: 20_000,
  totalCashback: 0,
  totalCashbackAmount: 0,
  unitInBox: 10,
  images: [],
  stepDiscounts: [],
  category: {
    id: 1,
    name: 'دسته',
    description: null,
    images: [],
    parentId: null,
  },
  brand: {
    id: 1,
    name: 'برند',
    manufacturer: {
      id: 1,
      name: 'تولیدکننده',
      description: null,
      images: [],
    },
    description: null,
    images: [],
  },
}

describe('ProductPriceTable', () => {
  test('shows the API cashback amount per carton without recalculating from the discounted price', () => {
    render(
      <ProductPriceTable
        product={{
          ...sampleAvailableProduct,
          totalCashback: 2,
          totalCashbackAmount: 2_400,
        }}
      />,
    )

    const label = screen.getByText('بازگشت اعتبار هر کارتن به کیف پول شما:')

    expect(label.parentElement).toHaveTextContent('۲۴۰')
  })

  test('hides the cashback row when the API returns no cashback', () => {
    render(<ProductPriceTable product={sampleAvailableProduct} />)

    expect(
      screen.queryByText('بازگشت اعتبار هر کارتن به کیف پول شما:'),
    ).not.toBeInTheDocument()
  })

  test('returns null when product is not available (purchasableQuantity === 0)', () => {
    const unpurchasable = { ...sampleAvailableProduct, purchasableQuantity: 0 }
    const { container } = render(<ProductPriceTable product={unpurchasable} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('renders retail and discounted prices when product has discount', () => {
    render(<ProductPriceTable product={sampleAvailableProduct} />)

    expect(screen.getByText('قیمت مصرف‌کننده:')).toBeInTheDocument()
    expect(screen.getByText('قیمت خرید تکی شما:')).toBeInTheDocument()
    expect(screen.getByText('سود شما از فروش هر عدد:')).toBeInTheDocument()
    expect(screen.getByText('قیمت یک کارتن:')).toBeInTheDocument()
    expect(screen.getByText('قیمت خرید کارتن شما:')).toBeInTheDocument()
  })

  test('hides discount rows when product has no discount', () => {
    const noDiscountProduct = {
      ...sampleAvailableProduct,
      totalDiscount: 0,
      unitDiscountedPrice: 12_000,
      boxDiscountedPrice: 120_000,
    }

    render(<ProductPriceTable product={noDiscountProduct} />)

    expect(screen.getByText('قیمت مصرف‌کننده:')).toBeInTheDocument()
    expect(screen.queryByText('قیمت خرید تکی شما:')).not.toBeInTheDocument()
    expect(
      screen.queryByText('سود شما از فروش هر عدد:'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('قیمت یک کارتن:')).toBeInTheDocument()
  })
})
