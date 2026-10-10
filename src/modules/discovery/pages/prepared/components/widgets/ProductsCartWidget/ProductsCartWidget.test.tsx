import type { ReactNode } from 'react'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingProductsCartHydratedWidget } from '@/api/models'
import type { ListingProductSummary } from '@/api/models'

import ProductsCartWidget from './ProductsCartWidget'

vi.mock('@/hooks/useClientState', () => ({
  useClientState: () => ({ value: null }),
}))

vi.mock('@/components/Animate', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/VisibilityTracker', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ProductCard', () => {
  const ProductCard = ({ product }: { product: ListingProductSummary }) => (
    <article>{product.name}</article>
  )
  return {
    default: Object.assign(ProductCard, {
      Skeleton: () => <div>loading product</div>,
    }),
  }
})

vi.mock('@/lib/Carousel', () => ({
  Carousel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

const product = (id: number) =>
  ({ id, name: `Product ${id}` }) as ListingProductSummary

const widget = (
  styles: Record<string, string> = {},
): ListingProductsCartHydratedWidget => ({
  id: 1,
  type: 'products_cart',
  name: 'انواع تنقلات',
  products: [product(1)],
  href: '/snacks',
  styles,
})

describe('ProductsCartWidget scallop header', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('keeps the scallop band visible over a painted row', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget({ header: 'scallop', headerColor: '#11A64A' })}
        index={0}
        bandTextColor="white"
      />,
    )

    const header = container.querySelector(
      '[data-slot="horizontal-product-list-header"]',
    )
    const band = container.querySelector('[data-slot="widget-scallop-band"]')

    expect(header).toHaveClass('isolate', 'pt-1', 'pb-3')
    expect(band).toBeInTheDocument()
    expect(band).toHaveStyle({ backgroundColor: '#11A64A' })
  })

  test('omits the scallop band when header styles are absent', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget()}
        index={0}
      />,
    )

    expect(
      container.querySelector('[data-slot="widget-scallop-band"]'),
    ).not.toBeInTheDocument()
  })
})

describe('ProductsCartWidget countdown timer', () => {
  const NOW = Date.parse('2026-10-01T12:00:00+03:30')
  const ENDS_AT = '2026-10-01T14:03:04+03:30'

  const timerStyles = (extra: Record<string, string> = {}) => ({
    timer: 'countdown',
    timerEndsAt: ENDS_AT,
    ...extra,
  })

  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  test('renders the countdown and a full label when the wavy header is off', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget(timerStyles())}
        index={0}
      />,
    )

    expect(container.querySelector('[data-slot="countdown"]')).toHaveAttribute(
      'aria-label',
      '02:03:04',
    )
    expect(
      Array.from(container.querySelectorAll('[data-slot="flip-digits"]')).map(
        (node) => Number(node.getAttribute('data-value')),
      ),
    ).toEqual([2, 3, 4])
    expect(
      container.querySelector('[data-slot="horizontal-product-list-header"]'),
    ).not.toHaveClass('pt-1')
    expect(
      container.querySelector(
        '[data-slot="horizontal-product-list-more-link"]',
      ),
    ).toHaveTextContent('مشاهده همه')
  })

  test('drops the label to an icon when the wavy header is on', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget(
          timerStyles({ header: 'scallop', headerColor: '#11A64A' }),
        )}
        index={0}
        bandTextColor="white"
      />,
    )

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="horizontal-product-list-header"]'),
    ).toHaveClass('pt-1', 'pb-3')
    expect(
      container.querySelector(
        '[data-slot="horizontal-product-list-more-link"]',
      ),
    ).not.toHaveTextContent('مشاهده همه')
  })

  test('hides only the countdown once the deadline passes, keeping the carousel', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget(
          timerStyles({ timerEndsAt: '2020-01-01T00:00:00+03:30' }),
        )}
        index={0}
      />,
    )

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Product 1')).toBeInTheDocument()
  })

  test('omits the countdown when the timer preset is absent', () => {
    const { container } = render(
      <ProductsCartWidget
        trackingId="products_cart-1"
        widget={widget({ timerEndsAt: ENDS_AT })}
        index={0}
      />,
    )

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).not.toBeInTheDocument()
  })
})
