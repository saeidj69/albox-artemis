import { ROUTES } from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen, waitFor } from '@/utils/test-utils'

import { OrderOrderPaymentMethod, PaymentPaymentMethod } from '@/api/models'
import { VerificationStatus } from '@/api/models/verificationStatus'

import CheckoutFooter from './index'

const push = vi.fn()
const sync = vi.fn()
const checkBasket = vi.fn()
const placeOrder = vi.fn()
const showBasketUpdatedSheet = vi.fn()
const track = vi.fn()

let mockPrimaryAddress: { id: number; name: string } | null = {
  id: 1,
  name: 'Home',
}
let mockVerificationStatus: string = VerificationStatus.verified
let mockIsChecking = false
let mockIsPlacing = false
let mockLocation = { latitude: 35.7, longitude: 51.4 }
let mockIsLocationLoading = false
let mockProductLines = [
  {
    productId: 101,
    quantity: 2,
    title: 'تست محصول',
    priceWhenAdded: 100_000,
  },
]
let mockCheckout = {
  selectedTimeSlotId: 55 as number | null,
  selectedPaymentMethod:
    OrderOrderPaymentMethod.ipg as OrderOrderPaymentMethod | null,
  walletUsage: false,
  comment: 'Special instruction',
}
let mockBasketData: {
  basket: {
    isOk: boolean
    totalPrice: number
    products: { productId: number; quantity: number; status: string }[]
  }
} | null = {
  basket: {
    isOk: true,
    totalPrice: 200_000,
    products: [{ productId: 101, quantity: 2, status: 'ok' }],
  },
}
let mockPaymentData: {
  methods: { type: { value: string }; maxAvailableAmount: number }[]
} | null = {
  methods: [
    {
      type: { value: PaymentPaymentMethod.ipg },
      maxAvailableAmount: 1_000_000,
    },
    { type: { value: PaymentPaymentMethod.cod }, maxAvailableAmount: 500_000 },
    {
      type: { value: PaymentPaymentMethod.credit },
      maxAvailableAmount: 300_000,
    },
  ],
}
let mockWalletInfo = {
  deductionAmount: 0,
  isEnabled: false,
  totalAmount: 300_000,
  isSufficient: false,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/modules/addresses/hooks', () => ({
  useUserAddresses: () => ({ primaryAddress: mockPrimaryAddress }),
  useLocation: () => ({
    location: mockLocation,
    isLoading: mockIsLocationLoading,
  }),
}))

vi.mock('@/modules/profile/hooks/useNationalCodeVerification', () => ({
  useNationalCodeVerification: () => ({
    verificationStatus: mockVerificationStatus,
  }),
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasket: () => ({ productLines: mockProductLines }),
  useCheckoutData: () => ({ checkout: mockCheckout }),
  useBasketRemoteSync: () => ({ sync }),
  useBasketCheckCall: () => ({
    data: mockBasketData,
    isChecking: mockIsChecking,
  }),
  useCheckoutWallet: () => mockWalletInfo,
}))

vi.mock('@/modules/purchase/utils', () => ({
  showBasketUpdatedSheet: (...args: unknown[]) =>
    showBasketUpdatedSheet(...args),
}))

vi.mock('@/api/functions/payment-management', () => ({
  useGetPaymentMethods: () => ({ data: mockPaymentData }),
}))

vi.mock('@/api/functions/basket', () => ({
  useCheckBasket: () => ({ mutateAsync: checkBasket }),
}))

vi.mock('@/api/functions/order', () => ({
  usePlaceOrder: () => ({ mutate: placeOrder, isPending: mockIsPlacing }),
}))

vi.mock('@/components/Layout', () => ({
  default: {
    Footer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
}))

vi.mock('./components/CheckoutPriceOverviewToggle', () => ({
  default: () => <div data-testid="checkout-price-toggle" />,
}))

describe('CheckoutFooter', () => {
  beforeEach(() => {
    push.mockReset()
    sync.mockReset()
    checkBasket.mockReset()
    placeOrder.mockReset()
    showBasketUpdatedSheet.mockReset()
    track.mockReset()

    sync.mockResolvedValue({ changed: false })
    checkBasket.mockResolvedValue({
      basket: {
        isOk: true,
        totalPrice: 200_000,
        products: [
          {
            productId: 101,
            quantity: 2,
            status: 'ok',
            details: {
              name: 'تست محصول',
              netPrice: 100_000,
              boxRetailPrice: 120_000,
              unitInBox: 12,
            },
          },
        ],
      },
    })

    mockPrimaryAddress = { id: 1, name: 'Home' }
    mockVerificationStatus = VerificationStatus.verified
    mockIsChecking = false
    mockIsPlacing = false
    mockLocation = { latitude: 35.7, longitude: 51.4 }
    mockIsLocationLoading = false
    mockProductLines = [
      {
        productId: 101,
        quantity: 2,
        title: 'تست محصول',
        priceWhenAdded: 100_000,
      },
    ]
    mockCheckout = {
      selectedTimeSlotId: 55,
      selectedPaymentMethod: OrderOrderPaymentMethod.ipg,
      walletUsage: false,
      comment: 'Special instruction',
    }
    mockBasketData = {
      basket: {
        isOk: true,
        totalPrice: 200_000,
        products: [{ productId: 101, quantity: 2, status: 'ok' }],
      },
    }
    mockPaymentData = {
      methods: [
        {
          type: { value: PaymentPaymentMethod.ipg },
          maxAvailableAmount: 1_000_000,
        },
        {
          type: { value: PaymentPaymentMethod.cod },
          maxAvailableAmount: 500_000,
        },
        {
          type: { value: PaymentPaymentMethod.credit },
          maxAvailableAmount: 300_000,
        },
      ],
    }
    mockWalletInfo = {
      deductionAmount: 0,
      isEnabled: false,
      totalAmount: 300_000,
      isSufficient: false,
    }
  })

  test('routes to address creation when primary address is missing', async () => {
    const user = userEvent.setup()
    mockPrimaryAddress = null

    render(<CheckoutFooter />)

    const btn = screen.getByRole('button', { name: 'انتخاب آدرس' })
    await user.click(btn)

    expect(push).toHaveBeenCalledWith(expect.stringContaining('/address'))
  })

  test('disables submit when national code is unverified', () => {
    mockVerificationStatus = VerificationStatus.pending

    render(<CheckoutFooter />)

    expect(screen.getByText('کد ملی شما تایید نشده است')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و پرداخت' }),
    ).toBeDisabled()
  })

  test('disables submit when timeslot is missing', () => {
    mockCheckout.selectedTimeSlotId = null

    render(<CheckoutFooter />)

    expect(screen.getByText('زمان تحویلی موجود نیست')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و پرداخت' }),
    ).toBeDisabled()
  })

  test('disables submit when payment method is unselected and wallet is insufficient', () => {
    mockCheckout.selectedPaymentMethod = null

    render(<CheckoutFooter />)

    expect(screen.getByText('روش پرداخت را انتخاب کنید')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و پرداخت' }),
    ).toBeDisabled()
  })

  test('disables submit when payable exceeds selected payment method maxAvailableAmount', () => {
    mockPaymentData = {
      methods: [
        {
          type: { value: PaymentPaymentMethod.ipg },
          maxAvailableAmount: 100_000,
        },
      ],
    }
    mockBasketData = {
      basket: { isOk: true, totalPrice: 200_000, products: [] },
    }

    render(<CheckoutFooter />)

    expect(
      screen.getByText('مبلغ قابل پرداخت بیشتر از حد مجاز روش انتخاب شده است'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و پرداخت' }),
    ).toBeDisabled()
  })

  test('shows wallet-only label when wallet balance fully covers total', () => {
    mockWalletInfo = {
      deductionAmount: 200_000,
      isEnabled: true,
      totalAmount: 300_000,
      isSufficient: true,
    }

    render(<CheckoutFooter />)

    expect(
      screen.getByRole('button', { name: 'تایید و پرداخت کیف پول' }),
    ).toBeEnabled()
  })

  test('shows COD label when COD is selected', () => {
    mockCheckout.selectedPaymentMethod = OrderOrderPaymentMethod.cod

    render(<CheckoutFooter />)

    expect(
      screen.getByRole('button', { name: 'نهایی کردن سفارش' }),
    ).toBeEnabled()
  })

  test('triggers showBasketUpdatedSheet when sync returns changed: true on submit', async () => {
    const user = userEvent.setup()
    sync.mockResolvedValueOnce({ changed: true })

    render(<CheckoutFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و پرداخت' }))

    expect(sync).toHaveBeenCalledTimes(1)
    expect(showBasketUpdatedSheet).toHaveBeenCalledTimes(1)
    expect(checkBasket).not.toHaveBeenCalled()
  })

  test('triggers showBasketUpdatedSheet when checkBasket returns isOk: false', async () => {
    const user = userEvent.setup()
    checkBasket.mockResolvedValueOnce({
      basket: { isOk: false, totalPrice: 200_000, products: [] },
    })

    render(<CheckoutFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و پرداخت' }))

    expect(sync).toHaveBeenCalledTimes(1)
    expect(checkBasket).toHaveBeenCalledTimes(1)
    expect(showBasketUpdatedSheet).toHaveBeenCalledTimes(1)
    expect(placeOrder).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalledWith(
      EVENTS.ORDER_SUBMIT,
      expect.anything(),
    )
  })

  test('happy path: submits placeOrder mutation with mapped payload and handles redirectUrl', async () => {
    const user = userEvent.setup()

    placeOrder.mockImplementation((payload, callbacks) => {
      callbacks.onSuccess({ redirectUrl: 'https://bank.example.com/pay' })
    })

    render(<CheckoutFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و پرداخت' }))

    await waitFor(() => {
      expect(placeOrder).toHaveBeenCalledWith(
        {
          data: {
            timeslotId: 55,
            paymentMethods: [OrderOrderPaymentMethod.ipg],
            products: [{ id: 101, quantity: 2 }],
            addressId: 1,
            paymentGateway: 'mellat',
            callbackUrl: expect.stringContaining('/payment/result'),
            comment: 'Special instruction',
          },
        },
        expect.any(Object),
      )
    })

    expect(track).not.toHaveBeenCalledWith(
      EVENTS.BEGIN_CHECKOUT,
      expect.anything(),
    )
    expect(track).toHaveBeenCalledWith(EVENTS.ORDER_SUBMIT, {
      webengage: {
        selected_payment_method: 1,
        item_id: '101',
        item_count: 2,
        value: 200_000,
        coupon: '',
      },
    })
    expect(track).toHaveBeenCalledWith(EVENTS.FINALIZED_ORDER, {
      plausible: true,
    })
    expect(track).toHaveBeenCalledWith(EVENTS.PAYMENT_METHOD_SELECTED, {
      plausible: { method: 'payment_online_after_finalization' },
    })
  })

  test('happy path: routes to ORDERS.ROOT when placeOrder has no redirectUrl', async () => {
    const user = userEvent.setup()

    placeOrder.mockImplementation((payload, callbacks) => {
      callbacks.onSuccess({ redirectUrl: null })
    })

    render(<CheckoutFooter />)

    await user.click(screen.getByRole('button', { name: 'تایید و پرداخت' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(ROUTES.ORDERS.ROOT)
    })
  })
})
