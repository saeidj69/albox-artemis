import type { ReactNode } from 'react'

import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import type { ListingProduct } from '@/api/models'

import ProductDetailsPage from './index'

const track = vi.fn()
const mockUseLocation = vi.fn()
const mockUseGetProductListing = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => mockUseLocation(),
}))

vi.mock('@/api/functions/catalogue', () => ({
  useGetProductListing: (...args: unknown[]) =>
    mockUseGetProductListing(...args),
}))

vi.mock('@/components/Header', () => ({ default: () => null }))
vi.mock('@/components/Header/components/HeaderAnimatedTitle', () => ({
  default: () => null,
}))
vi.mock('@/components/Header/components/HeaderBackButton', () => ({
  default: () => null,
}))
vi.mock('@/components/Header/components/HeaderLogo', () => ({
  default: () => null,
}))
vi.mock('@/components/HorizontalProductList', () => ({ default: () => null }))
vi.mock('@/components/Layout', () => ({
  default: {
    Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}))
vi.mock('./components/product-breadcrumb', () => ({ default: () => null }))
vi.mock('./components/product-details-page.skeleton', () => ({
  default: () => <div data-testid="product-details-skeleton" />,
}))
vi.mock('./components/product-footer', () => ({ default: () => null }))
vi.mock('./components/product-image-section', () => ({ default: () => null }))
vi.mock('./components/product-info-header', () => ({ default: () => null }))
vi.mock('./components/product-price-table', () => ({ default: () => null }))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

const sampleProduct: ListingProduct = {
  id: 101,
  name: 'تست محصول',
  isPromoted: false,
  purchasableQuantity: 10,
  boxRetailPrice: 120_000,
  boxDiscountedPrice: 100_000,
  unitRetailPrice: 12_000,
  unitDiscountedPrice: 10_000,
  unitDiscountAmount: 2_000,
  totalDiscount: 20_000,
  totalDiscountAmount: 20_000,
  totalCashback: 2,
  totalCashbackAmount: 2_000,
  unitInBox: 12,
  images: [],
  stepDiscounts: [],
  category: {
    id: 1,
    name: 'روغن',
    description: null,
    images: [],
    parentId: null,
  },
  brand: {
    id: 1,
    name: 'بهار',
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

describe('ProductDetailsPage tracking', () => {
  beforeEach(() => {
    track.mockReset()
    mockUseLocation.mockReset()
    mockUseGetProductListing.mockReset()
    mockUseLocation.mockReturnValue({
      location: { latitude: 35.7, longitude: 51.4 },
      isLoading: false,
    })
  })

  test('tracks view_item via GTM and WebEngage when a product loads', () => {
    mockUseGetProductListing.mockReturnValue({
      data: { product: sampleProduct, metadata: { relatedProducts: [] } },
    })

    render(<ProductDetailsPage productId={101} />)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_ITEM, {
      gtm: {
        ecommerce: {
          currency: 'IRR',
          value: 100_000,
          items: [
            expect.objectContaining({
              item_id: '101',
              item_name: 'تست محصول',
            }),
          ],
        },
      },
      webengage: {
        item_id: '101',
        item_name: 'تست محصول',
        item_category: 'روغن',
        item_brand: 'بهار',
        discount: 20_000,
        cashback_percentage: 2,
        item_price: 100_000,
      },
    })
  })

  test('does not track view_item when the product has not loaded', () => {
    mockUseGetProductListing.mockReturnValue({ data: undefined })

    render(<ProductDetailsPage productId={101} />)

    expect(track).not.toHaveBeenCalled()
  })
})
