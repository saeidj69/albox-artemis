import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BasketProducts from './index'

const clear = vi.fn()
const showSheet = vi.fn()
const hideSheet = vi.fn()
const track = vi.fn()

let mockProductLines: { productId: number }[] = []
let mockHasError = false
let mockData: unknown = null
let mockIsChecking = false
let mockItemsWithAlerts: {
  product: { productId: number }
  localProduct: {
    productId: number
    title?: string
    quantity?: number
    priceWhenAdded?: number
  }
  alerts: { text: string; severity: string }[]
}[] = []

vi.mock('@/modules/purchase/hooks', () => ({
  useBasket: () => ({
    productLines: mockProductLines,
  }),
  useBasketAlerts: () => ({
    items: mockItemsWithAlerts,
    hasError: mockHasError,
    applyProposedChanges: vi.fn(),
  }),
  useBasketCheckCall: () => ({
    data: mockData,
    isChecking: mockIsChecking,
    clear,
  }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
    hideSheet: (...args: unknown[]) => hideSheet(...args),
  }
})

vi.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: () => [null],
}))

vi.mock('@/components/BasketProductCard', () => {
  const Skeleton = () => <div data-testid="basket-product-skeleton" />
  const Card = ({
    children,
    product,
  }: {
    children?: React.ReactNode
    product: { productId: number }
  }) => (
    <div data-testid={`basket-product-${product.productId}`}>{children}</div>
  )
  return {
    default: Object.assign(Card, { Skeleton }),
  }
})

vi.mock('../BasketAddress', () => ({
  default: () => <div data-testid="basket-address" />,
}))

vi.mock('../BasketEmpty', () => ({
  default: () => <div data-testid="basket-empty" />,
}))

vi.mock('../BasketNationalCodeVerification', () => ({
  default: () => <div data-testid="basket-national-code" />,
}))

vi.mock('../BasketAlert', () => ({
  default: () => <div data-testid="basket-alert" />,
}))

describe('BasketProducts', () => {
  beforeEach(() => {
    clear.mockReset()
    showSheet.mockReset()
    hideSheet.mockReset()
    track.mockReset()
    mockProductLines = []
    mockHasError = false
    mockData = null
    mockIsChecking = false
    mockItemsWithAlerts = []
  })

  test('renders empty state when basket has no lines and is not checking', () => {
    mockProductLines = []
    mockIsChecking = false

    render(<BasketProducts />)

    expect(screen.getByTestId('basket-empty')).toBeInTheDocument()
    expect(screen.queryByText('سبد خرید شما')).not.toBeInTheDocument()
  })

  test('renders skeletons while lines exist but check data has not loaded', () => {
    mockProductLines = [{ productId: 1 }]
    mockData = null

    render(<BasketProducts />)

    expect(screen.getAllByTestId('basket-product-skeleton')).toHaveLength(4)
  })

  test('shows BasketAlert instead of BasketAddress when hasError', () => {
    mockProductLines = [{ productId: 1 }]
    mockData = { basket: { products: [] } }
    mockHasError = true
    mockItemsWithAlerts = [
      {
        product: { productId: 1 },
        localProduct: { productId: 1 },
        alerts: [{ text: 'خطا', severity: 'error' }],
      },
    ]

    render(<BasketProducts />)

    expect(screen.getByTestId('basket-alert')).toBeInTheDocument()
    expect(screen.queryByTestId('basket-address')).not.toBeInTheDocument()
  })

  test('shows BasketAddress instead of BasketAlert when no error', () => {
    mockProductLines = [{ productId: 1 }]
    mockData = { basket: { products: [] } }
    mockHasError = false
    mockItemsWithAlerts = [
      {
        product: { productId: 1 },
        localProduct: { productId: 1 },
        alerts: [],
      },
    ]

    render(<BasketProducts />)

    expect(screen.getByTestId('basket-address')).toBeInTheDocument()
    expect(screen.queryByTestId('basket-alert')).not.toBeInTheDocument()
  })

  test('tracks view_cart with GTM ecommerce and WebEngage cart attributes', () => {
    mockProductLines = [{ productId: 101 }, { productId: 202 }]
    mockData = { basket: { products: [], totalPrice: 300_000 } }
    mockItemsWithAlerts = [
      {
        product: { productId: 101 },
        localProduct: {
          productId: 101,
          title: 'A',
          quantity: 2,
          priceWhenAdded: 100_000,
        },
        alerts: [],
      },
      {
        product: { productId: 202 },
        localProduct: {
          productId: 202,
          title: 'B',
          quantity: 1,
          priceWhenAdded: 100_000,
        },
        alerts: [],
      },
    ]

    render(<BasketProducts />)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CART, {
      gtm: {
        ecommerce: expect.objectContaining({
          currency: 'IRR',
          value: 300_000,
        }),
      },
      webengage: {
        item_count: 3,
        value: 300_000,
        item_id: '101,202',
      },
    })
  })

  test('opens clear-basket sheet and clears on confirm', async () => {
    const user = userEvent.setup()
    mockProductLines = [{ productId: 1 }]
    mockData = { basket: { products: [] } }
    mockItemsWithAlerts = [
      {
        product: { productId: 1 },
        localProduct: { productId: 1 },
        alerts: [],
      },
    ]

    render(<BasketProducts />)

    const trashButton = screen.getByRole('button')
    await user.click(trashButton)

    expect(showSheet).toHaveBeenCalledTimes(1)
    const [, sheetProps] = showSheet.mock.calls[0] as [
      unknown,
      {
        title: string
        description: string
        actions: { id: string; onClick: () => void }[]
      },
    ]

    expect(sheetProps.title).toBe('حذف سبد خرید')
    expect(sheetProps.description).toBe(
      'آیا می خواهید سبد خرید خود را حذف کنید؟',
    )

    const clearAction = sheetProps.actions.find((a) => a.id === 'clear-basket')
    expect(clearAction).toBeDefined()
    expect(track).not.toHaveBeenCalledWith(EVENTS.BASKET_CLEARED, {
      webengage: true,
    })
    clearAction?.onClick()

    expect(clear).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.BASKET_CLEARED, {
      webengage: true,
    })
    expect(hideSheet).toHaveBeenCalled()
  })

  test('does not track basket_cleared when the user cancels', async () => {
    const user = userEvent.setup()
    mockProductLines = [{ productId: 1 }]
    mockData = { basket: { products: [] } }
    mockItemsWithAlerts = [
      {
        product: { productId: 1 },
        localProduct: { productId: 1 },
        alerts: [],
      },
    ]

    render(<BasketProducts />)

    await user.click(screen.getByRole('button'))

    const [, sheetProps] = showSheet.mock.calls[0] as [
      unknown,
      { actions: { id: string; onClick: () => void }[] },
    ]
    const cancelAction = sheetProps.actions.find((a) => a.id === 'cancel')
    cancelAction?.onClick()

    expect(clear).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalledWith(EVENTS.BASKET_CLEARED, {
      webengage: true,
    })
  })
})
