import {
  mockAllIsIntersecting,
  resetIntersectionMocking,
  setupIntersectionMocking,
} from 'react-intersection-observer/test-utils'

import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resetCashbackPreviewClaimForTests } from '@/components/CashbackBadge/hooks/use-cashback-preview'

import { render } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import ProductCard from './ProductCard'

const page = vi.hoisted(() => ({ pathname: '/explore' }))
vi.mock('next/navigation', () => ({ usePathname: () => page.pathname }))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: vi.fn(),
  }
})
vi.mock('@/hooks/useClientState', () => ({
  useClientState: () => ({ setValue: vi.fn() }),
}))
vi.mock('@/modules/purchase/hooks', () => ({
  useBasketEntity: () => ({ quantity: 0 }),
}))
vi.mock(
  '@/modules/purchase/components/add-to-basket/hooks/use-add-to-basket',
  () => ({
    useAddToBasket: () => ({
      quantity: 0,
      atMax: false,
      onIncrement: vi.fn(),
      onDecrement: vi.fn(),
      longPressHandlers: {},
      stopCardNavigation: vi.fn(),
    }),
  }),
)

const product = {
  id: 123,
  name: 'محصول تست',
  isPromoted: false,
  purchasableQuantity: 10,
  unitInBox: 6,
  unitRetailPrice: 1000,
  unitDiscountedPrice: 900,
  unitDiscountAmount: 100,
  boxRetailPrice: 6000,
  boxDiscountedPrice: 5400,
  totalDiscount: 10,
  totalDiscountAmount: 600,
  totalCashback: 2,
  totalCashbackAmount: 120,
  images: [],
  stepDiscounts: [],
  category: {
    id: 1,
    name: 'دسته',
    parentId: null,
  },
  brand: {
    id: 1,
    name: 'برند',
    manufacturer: { id: 1, name: 'سازنده' },
  },
} satisfies ListingProductSummary

describe('ProductCard cashback preview visibility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setupIntersectionMocking(vi.fn)
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    page.pathname = '/explore'
    resetCashbackPreviewClaimForTests()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    resetIntersectionMocking()
    vi.useRealTimers()
  })

  it('keeps observing when an offscreen card becomes partially visible', () => {
    const observers = new Set<{
      callback: IntersectionObserverCallback
      instance: IntersectionObserver
      targets: Set<Element>
    }>()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        const targets = new Set<Element>()
        const instance = {
          root: options?.root ?? null,
          rootMargin: options?.rootMargin ?? '0px',
          scrollMargin: options?.scrollMargin ?? '0px',
          thresholds: [Number(options?.threshold ?? 0)],
          observe: (target: Element) => targets.add(target),
          unobserve: (target: Element) => targets.delete(target),
          disconnect: () => targets.clear(),
          takeRecords: () => [],
        } satisfies IntersectionObserver
        observers.add({ callback, instance, targets })
        return instance
      }),
    )
    const emitVisibility = (
      isIntersecting: boolean,
      intersectionRatio: number,
    ) => {
      for (const { callback, instance, targets } of observers) {
        const entries = Array.from(targets, (target) => ({
          target,
          isIntersecting,
          intersectionRatio,
          time: performance.now(),
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
        }))
        if (entries.length > 0) callback(entries, instance)
      }
    }

    const { container } = render(<ProductCard product={product} />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')!
    act(() => emitVisibility(false, 0))
    // Browsers report intersection before the configured threshold is reached.
    act(() => emitVisibility(true, 0.5))
    act(() => vi.advanceTimersByTime(6000))
    expect(badge).toHaveAttribute('data-collapsed', 'true')

    act(() => emitVisibility(true, 1))
    act(() => vi.advanceTimersByTime(500))
    expect(badge).not.toHaveAttribute('data-collapsed')
  })

  it('waits for full visibility without an add-to-basket preview flag', () => {
    const { container } = render(<ProductCard product={product} />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')!
    act(() => vi.advanceTimersByTime(6000))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => mockAllIsIntersecting(0.99))
    act(() => vi.advanceTimersByTime(6000))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => mockAllIsIntersecting(1))
    act(() => vi.advanceTimersByTime(500))
    expect(badge).not.toHaveAttribute('data-collapsed')
    act(() => vi.advanceTimersByTime(3000))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => mockAllIsIntersecting(false))
    act(() => mockAllIsIntersecting(true))
    act(() => vi.advanceTimersByTime(500))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
  })

  it('allows only one product to expand per page visit, including remounts', () => {
    const { container, rerender } = render(
      <>
        <ProductCard product={product} />
        <ProductCard product={{ ...product, id: 124 }} />
      </>,
    )
    act(() => mockAllIsIntersecting(1))
    act(() => vi.advanceTimersByTime(500))
    expect(
      container.querySelectorAll(
        '[data-slot="cashback-badge"]:not([data-collapsed])',
      ),
    ).toHaveLength(1)
    rerender(
      <ProductCard key="replacement" product={{ ...product, id: 125 }} />,
    )
    act(() => mockAllIsIntersecting(1))
    act(() => vi.advanceTimersByTime(500))
    expect(
      container.querySelector('[data-slot="cashback-badge"]'),
    ).toHaveAttribute('data-collapsed', 'true')
  })

  it('starts fresh on another page and when returning to the original page', () => {
    const { container, rerender } = render(
      <ProductCard key="first" product={product} />,
    )
    act(() => mockAllIsIntersecting(1))
    act(() => vi.advanceTimersByTime(3500))
    for (const pathname of ['/products/123', '/explore']) {
      page.pathname = pathname
      rerender(<ProductCard key={pathname} product={product} />)
      act(() => mockAllIsIntersecting(1))
      act(() => vi.advanceTimersByTime(500))
      expect(
        container.querySelector('[data-slot="cashback-badge"]'),
      ).not.toHaveAttribute('data-collapsed')
    }
  })

  it('does not observe products without cashback', () => {
    render(<ProductCard product={{ ...product, totalCashback: 0 }} />)
    expect(IntersectionObserver).not.toHaveBeenCalled()
  })
})
