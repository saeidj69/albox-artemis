import type { ReactNode } from 'react'

import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { fireEvent, render, screen } from '@/utils/test-utils'

import BasketRecommendations from './index'

const getRecommendations = vi.fn()
const recordRecommendationEvents = vi.fn()
const track = vi.fn()
let mockHasError = true
let mockRecommendationTitle: 'dont_miss_out' | 'ai' | 'popular_nearby' =
  'dont_miss_out'
let mockRecommendationOrder: 'others_also_buy' | 'recommended_for_you' =
  'others_also_buy'

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/components/HorizontalProductList', () => ({
  default: ({
    title,
    onProductOpen,
    onProductFullyVisible,
  }: {
    title: ReactNode
    onProductOpen?: (product: unknown, index: number) => void
    onProductFullyVisible?: (product: unknown, index: number) => void
  }) => (
    <div>
      {title}
      <button type="button" onClick={() => onProductOpen?.({}, 0)}>
        open recommended product
      </button>
      <button type="button" onClick={() => onProductFullyVisible?.({}, 1)}>
        see second recommended product
      </button>
      <button type="button" onClick={() => onProductOpen?.({}, 1)}>
        open second recommended product
      </button>
    </div>
  ),
}))

vi.mock('@/modules/experiments', () => ({
  EXPERIMENTS: {
    BASKET_RECOMMENDATION_ORDER: { id: 'basket-recommendation-order' },
    BASKET_RECOMMENDATION_TITLE: { id: 'basket-recommendation-title' },
  },
  useExperiment: (experiment: { id: string }) =>
    experiment.id === 'basket-recommendation-order'
      ? {
          key: mockRecommendationOrder,
          payload: { primaryGroup: mockRecommendationOrder },
        }
      : {
          key: mockRecommendationTitle,
          payload: { title: mockRecommendationTitle },
        },
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasket: () => ({ productLines: [{ productId: 10 }] }),
  useBasketAlerts: () => ({ hasError: mockHasError }),
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({
    location: { latitude: 35.7, longitude: 51.4 },
    isLoading: false,
  }),
}))

vi.mock('@/api/functions/catalogue', () => ({
  getProductRecommendationsListing: (...args: unknown[]) =>
    getRecommendations(...args),
  recordProductRecommendationEventsListing: (...args: unknown[]) =>
    recordRecommendationEvents(...args),
}))

describe('BasketRecommendations', () => {
  beforeEach(() => {
    mockHasError = true
    mockRecommendationTitle = 'dont_miss_out'
    mockRecommendationOrder = 'others_also_buy'
    getRecommendations.mockReset()
    recordRecommendationEvents.mockReset()
    track.mockReset()
    recordRecommendationEvents.mockResolvedValue(undefined)
    getRecommendations.mockResolvedValue({
      metadata: { recommendationId: crypto.randomUUID() },
      groups: [
        {
          type: 'others_also_buy',
          products: [{ id: 20 }],
        },
      ],
    })
  })

  test('does not render or request recommendations while the basket alert is shown', () => {
    render(<BasketRecommendations />)

    expect(screen.queryByText('از دستت نره!')).not.toBeInTheDocument()
    expect(getRecommendations).not.toHaveBeenCalled()
  })

  test('renders as a normal section without sticky controls', async () => {
    mockHasError = false
    render(<BasketRecommendations />)

    await screen.findByText('از دستت نره!')

    const recommendation = document.querySelector(
      '[data-slot="basket-recommendations"]',
    )

    expect(recommendation).not.toHaveClass('fixed')
    expect(
      document.querySelector(
        '[data-slot="basket-recommendations-drag-handle"]',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'بردن پیشنهادها به انتهای سبد',
      }),
    ).not.toBeInTheDocument()
  })

  test('renders the animated AI title for its experiment variant', async () => {
    mockHasError = false
    mockRecommendationTitle = 'ai'

    render(<BasketRecommendations />)

    expect(
      await screen.findByText('پیشنهاد هوش مصنوعی آل‌باکس به شما'),
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="basket-recommendations-ai-icon"]'),
    ).toHaveAttribute('src', '/images/allbox-ai-robot-animated-min.svg')
    expect(screen.queryByText('از دستت نره!')).not.toBeInTheDocument()
  })

  test('renders the nearby popularity title for its experiment variant', async () => {
    mockHasError = false
    mockRecommendationTitle = 'popular_nearby'

    render(<BasketRecommendations />)

    expect(
      await screen.findByText(
        'این کالاها بین فروشگاه‌های اطراف شما پرطرفدارند',
      ),
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="basket-recommendations-ai-icon"]'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('از دستت نره!')).not.toBeInTheDocument()
  })

  describe('GTM list tracking', () => {
    const recommendedProduct = (id: number) => ({
      id,
      name: `Product ${id}`,
      unitInBox: 12,
      boxDiscountedPrice: 900_000,
      boxRetailPrice: 1_000_000,
      brand: { name: 'Brand' },
      category: { name: 'Category' },
    })

    beforeEach(() => {
      mockHasError = false
      getRecommendations.mockResolvedValue({
        metadata: { recommendationId: crypto.randomUUID() },
        groups: [
          {
            type: 'others_also_buy',
            products: [recommendedProduct(20), recommendedProduct(21)],
          },
        ],
      })
    })

    test('sends view_item_list with the card position, not 0', async () => {
      render(<BasketRecommendations />)

      fireEvent.click(
        await screen.findByRole('button', {
          name: 'see second recommended product',
        }),
      )

      expect(track).toHaveBeenCalledWith(EVENTS.VIEW_ITEM_LIST, {
        gtm: {
          ecommerce: expect.objectContaining({
            item_list_id: 'basket-recommendations',
            items: [expect.objectContaining({ item_id: '21', index: 1 })],
          }),
        },
      })
    })

    test('sends select_item with the card position, not 0', async () => {
      render(<BasketRecommendations />)

      fireEvent.click(
        await screen.findByRole('button', {
          name: 'open second recommended product',
        }),
      )

      expect(track).toHaveBeenCalledWith(EVENTS.SELECT_ITEM, {
        gtm: {
          ecommerce: expect.objectContaining({
            item_list_id: 'basket-recommendations',
            items: [expect.objectContaining({ item_id: '21', index: 1 })],
          }),
        },
      })
    })
  })
})
