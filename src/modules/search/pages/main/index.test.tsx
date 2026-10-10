import type { ReactNode } from 'react'

import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { fireEvent, render, screen } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import SearchMainPage from './index'

type InViewOptions = { onChange?: (inView: boolean) => void }

const { track, visibilityOptions, mockProducts } = vi.hoisted(() => ({
  track: vi.fn(),
  visibilityOptions: [] as InViewOptions[],
  mockProducts: { current: [] as unknown[] },
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('react-intersection-observer', () => ({
  useInView: (options: InViewOptions = {}) => {
    if (options.onChange) visibilityOptions.push(options)
    return { ref: vi.fn(), inView: true }
  },
  InView: () => null,
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({
    location: { latitude: 35.7, longitude: 51.4 },
    isLoading: false,
  }),
}))

vi.mock('@/api/functions/catalogue', () => ({
  useSearchProductsListingInfinite: () => ({
    data: {
      pages: [
        { products: mockProducts.current, metadata: { nextCursor: null } },
      ],
    },
    isLoading: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}))

vi.mock('@/components/ProductCard', () => {
  const ProductCard = ({
    product,
    onProductOpen,
  }: {
    product: ListingProductSummary
    onProductOpen?: () => void
  }) => (
    <button type="button" onClick={onProductOpen}>
      {product.name}
    </button>
  )

  return {
    default: Object.assign(ProductCard, { Skeleton: () => null }),
  }
})

vi.mock('@/components/Animate', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('@/components/Header', () => ({
  default: () => null,
  HeaderLogo: () => null,
}))
vi.mock('@/components/Header/components/HeaderAnimatedTitle', () => ({
  default: () => null,
}))
vi.mock('@/components/Header/components/HeaderBackButton', () => ({
  default: () => null,
}))
vi.mock('@/components/Layout', () => ({
  default: {
    Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}))
vi.mock('@/modules/search/pages/main/components/search-page-toolbar', () => ({
  default: () => null,
}))

const product = (id: number) =>
  ({
    id,
    name: `Product ${id}`,
    unitInBox: 12,
    boxDiscountedPrice: 900_000,
    boxRetailPrice: 1_000_000,
    brand: { name: 'Brand' },
    category: { name: 'Category' },
  }) as unknown as ListingProductSummary

describe('SearchMainPage product list tracking', () => {
  beforeEach(() => {
    track.mockReset()
    visibilityOptions.length = 0
    mockProducts.current = [product(1), product(2), product(3)]
  })

  test('tracks view_item_list with the card position when a card becomes visible', () => {
    render(<SearchMainPage searchParams={{}} />)

    expect(visibilityOptions).toHaveLength(3)

    visibilityOptions[2]?.onChange?.(true)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_ITEM_LIST, {
      gtm: {
        ecommerce: expect.objectContaining({
          item_list_id: 'search',
          item_list_name: 'search',
          items: [expect.objectContaining({ item_id: '3', index: 2 })],
        }),
      },
    })
  })

  test('does not track cards that never become visible', () => {
    render(<SearchMainPage searchParams={{}} />)

    visibilityOptions[0]?.onChange?.(false)

    expect(track).not.toHaveBeenCalledWith(
      EVENTS.VIEW_ITEM_LIST,
      expect.anything(),
    )
  })

  test('tracks select_item with the card position when a card is opened', () => {
    render(<SearchMainPage searchParams={{}} />)

    fireEvent.click(screen.getByRole('button', { name: 'Product 2' }))

    expect(track).toHaveBeenCalledWith(EVENTS.SELECT_ITEM, {
      gtm: {
        ecommerce: expect.objectContaining({
          item_list_id: 'search',
          items: [expect.objectContaining({ item_id: '2', index: 1 })],
        }),
      },
    })
  })
})
