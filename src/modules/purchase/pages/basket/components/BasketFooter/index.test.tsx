import { act } from 'react'

import { ROUTES } from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { VerificationStatus } from '@/api/models/verificationStatus'

import DeliveryTimeslotSheet from '../DeliveryTimeslotSheet'
import BasketFooter from './index'

const push = vi.fn()
const sync = vi.fn()
const checkBasket = vi.fn()
const setSelectedTimeSlotId = vi.fn()
const showSheet = vi.fn()
const showBasketUpdatedSheet = vi.fn()
const track = vi.fn()

let mockFooterHeight = 132
let notifyResize = () => {}

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    notifyResize = () => callback([], this as unknown as ResizeObserver)
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get: () => mockFooterHeight,
})

let mockPrimaryAddress: { id: number } | null = { id: 1 }
let mockVerificationStatus: string = VerificationStatus.verified
let mockIsSyncing = false
let mockIsChecking = false
type MockProductLine = {
  productId: number
  quantity?: number
  title?: string
  priceWhenAdded?: number
}
type MockBasketProduct = {
  productId: number
  quantity: number
  status: string
  details?: {
    name: string
    unitInBox: number
    netPrice: number
    boxRetailPrice: number
  }
}

let mockProductLines: MockProductLine[] = [{ productId: 1 }]
let mockSelectedTimeSlotId: number | null = null
let mockData: {
  basket: {
    isOk: boolean
    totalPrice: number
    products?: MockBasketProduct[]
    appliedRules: {
      type: string
      passed: boolean
      errorMessage: string | null
      properties: Record<string, number>
    }[]
  }
} | null = {
  basket: {
    isOk: true,
    totalPrice: 500_000,
    appliedRules: [],
  },
}

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/modules/profile/hooks/useNationalCodeVerification', () => ({
  useNationalCodeVerification: () => ({
    verificationStatus: mockVerificationStatus,
  }),
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useUserAddresses: () => ({
    primaryAddress: mockPrimaryAddress,
  }),
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasket: () => ({
    productLines: mockProductLines,
  }),
  useBasketRemoteSync: () => ({
    sync,
    isSyncing: mockIsSyncing,
  }),
  useCheckoutData: () => ({
    checkout: { selectedTimeSlotId: mockSelectedTimeSlotId },
    setSelectedTimeSlotId,
  }),
  useBasketCheckCall: () => ({
    data: mockData,
    isChecking: mockIsChecking,
    call: checkBasket,
  }),
}))

vi.mock('@/modules/purchase/utils', () => ({
  showBasketUpdatedSheet: (...args: unknown[]) =>
    showBasketUpdatedSheet(...args),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
  }
})

vi.mock('@/components/Layout', () => ({
  default: {
    Footer: ({
      children,
      height,
    }: {
      children: React.ReactNode
      height: number
    }) => (
      <div data-testid="layout-footer" data-reserved-height={height}>
        {children}
      </div>
    ),
  },
}))

vi.mock('./components/BasketPriceOverviewToggle', () => ({
  default: () => <div data-testid="price-overview-toggle" />,
}))

describe('BasketFooter', () => {
  beforeEach(() => {
    mockFooterHeight = 132
    notifyResize = () => {}
    push.mockReset()
    sync.mockReset()
    checkBasket.mockReset()
    setSelectedTimeSlotId.mockReset()
    showSheet.mockReset()
    showBasketUpdatedSheet.mockReset()
    track.mockReset()
    sync.mockResolvedValue({ changed: false })

    mockPrimaryAddress = { id: 1 }
    mockVerificationStatus = VerificationStatus.verified
    mockIsSyncing = false
    mockIsChecking = false
    mockProductLines = [{ productId: 1 }]
    mockSelectedTimeSlotId = null
    mockData = {
      basket: {
        isOk: true,
        totalPrice: 500_000,
        products: [],
        appliedRules: [],
      },
    }
  })

  test('renders null when basket has no product lines', () => {
    mockProductLines = []
    const { container } = render(<BasketFooter />)
    expect(container).toBeEmptyDOMElement()
  })

  test('reserves the rendered footer height as it changes', () => {
    render(<BasketFooter />)

    expect(screen.getByTestId('layout-footer')).toHaveAttribute(
      'data-reserved-height',
      '132',
    )
    act(() => {
      mockFooterHeight = 245
      notifyResize()
    })

    expect(screen.getByTestId('layout-footer')).toHaveAttribute(
      'data-reserved-height',
      '245',
    )
  })

  test('routes to add address when primary address is missing', async () => {
    const user = userEvent.setup()
    mockPrimaryAddress = null

    render(<BasketFooter />)

    const button = screen.getByRole('button', { name: 'افزودن آدرس' })
    await user.click(button)

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(ROUTES.SELECT_LOCATION),
    )
  })

  test('routes to profile edit when national code is unverified', async () => {
    const user = userEvent.setup()
    mockVerificationStatus = VerificationStatus.pending

    render(<BasketFooter />)

    expect(screen.getByText('کد ملی شما تایید نشده است')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'ویرایش اطلاعات' })
    await user.click(button)

    expect(push).toHaveBeenCalledWith(ROUTES.PROFILE.EDIT)
  })

  test('disables submit and shows min-price progress when rule fails', () => {
    mockData = {
      basket: {
        isOk: true,
        totalPrice: 100_000,
        appliedRules: [
          {
            type: 'min_basket_price',
            passed: false,
            errorMessage: null,
            properties: { minBasketPrice: 500_000 },
          },
        ],
      },
    }

    render(<BasketFooter />)

    expect(
      screen.getByText('مبلغ باقی مانده تا حداقل خرید'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toBeDisabled()
  })

  test('disables submit and shows brand-rule message when rule fails', () => {
    mockData = {
      basket: {
        isOk: true,
        totalPrice: 500_000,
        appliedRules: [
          {
            type: 'min_unique_product_brands',
            passed: false,
            errorMessage: null,
            properties: { minUniqueBrandsCount: 3 },
          },
        ],
      },
    }

    render(<BasketFooter />)

    expect(
      screen.getByText('خرید از حداقل 3 برند متفاوت الزامی است'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toBeDisabled()
  })

  test('disables submit when basket isOk is false', () => {
    mockData = {
      basket: {
        isOk: false,
        totalPrice: 500_000,
        appliedRules: [],
      },
    }

    render(<BasketFooter />)

    expect(
      screen.getByText('سبد خرید نیاز به بازبینی دارد'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toBeDisabled()
  })

  test('happy path: sync, check, open timeslot sheet, then navigate to checkout', async () => {
    const user = userEvent.setup()
    mockSelectedTimeSlotId = 10

    render(<BasketFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و تکمیل خرید' }))

    expect(sync).toHaveBeenCalledTimes(1)
    expect(checkBasket).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.CHECKOUT_STARTED, {
      plausible: true,
    })
    expect(showSheet).toHaveBeenCalledWith(
      DeliveryTimeslotSheet,
      expect.objectContaining({
        initialSelected: 10,
        onConfirm: expect.any(Function),
      }),
    )
    expect(showBasketUpdatedSheet).not.toHaveBeenCalled()

    const sheetProps = showSheet.mock.calls[0][1] as {
      onConfirm: (id: number) => void
    }
    sheetProps.onConfirm(99)

    expect(setSelectedTimeSlotId).toHaveBeenCalledWith(99)
    expect(push).toHaveBeenCalledWith(ROUTES.CHECKOUT)
  })

  test('tracks begin_checkout only once the delivery timeslot is confirmed', async () => {
    const user = userEvent.setup()
    mockProductLines = [
      { productId: 101, quantity: 2, title: 'تست محصول', priceWhenAdded: 1 },
    ]
    mockData = {
      basket: {
        isOk: true,
        totalPrice: 200_000,
        appliedRules: [],
        products: [
          {
            productId: 101,
            quantity: 2,
            status: 'ok',
            details: {
              name: 'تست محصول',
              unitInBox: 12,
              netPrice: 100_000,
              boxRetailPrice: 120_000,
            },
          },
          { productId: 202, quantity: 1, status: 'not_found' },
        ],
      },
    }

    render(<BasketFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و تکمیل خرید' }))

    expect(track).not.toHaveBeenCalledWith(
      EVENTS.BEGIN_CHECKOUT,
      expect.anything(),
    )

    const sheetProps = showSheet.mock.calls[0][1] as {
      onConfirm: (id: number) => void
    }
    sheetProps.onConfirm(99)

    expect(track).toHaveBeenCalledWith(EVENTS.BEGIN_CHECKOUT, {
      gtm: {
        ecommerce: {
          currency: 'IRR',
          value: 200_000,
          coupon: '',
          items: [
            {
              item_id: '101',
              item_name: 'تست محصول',
              item_brand: '',
              item_category: '',
              item_variant: 'کارتن ۱۲ عددی',
              price: 100_000,
              quantity: 2,
              discount: 20_000,
              index: 0,
            },
          ],
        },
      },
    })
  })

  test('shows basket-updated sheet when sync reports changed', async () => {
    const user = userEvent.setup()
    sync.mockResolvedValue({ changed: true })

    render(<BasketFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و تکمیل خرید' }))

    expect(showBasketUpdatedSheet).toHaveBeenCalledWith(
      expect.objectContaining({ push }),
    )
    expect(showSheet).not.toHaveBeenCalled()
    expect(checkBasket).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })

  test('shows loading state on button while checking or syncing', () => {
    mockIsChecking = true

    render(<BasketFooter />)

    expect(
      screen.getByRole('button', { name: 'تایید و تکمیل خرید' }),
    ).toHaveAttribute('data-loading', 'true')
  })
})
