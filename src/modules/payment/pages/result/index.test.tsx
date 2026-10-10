import { ROUTES } from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { persianDigits } from '@/utils/numbers'
import { render, screen } from '@/utils/test-utils'

import { PAYMENT_RESULT_COPY } from './constants'
import PaymentResultPage from './index'

const replace = vi.fn()
const push = vi.fn()
const back = vi.fn()
const clearBasket = vi.fn()
const clearCheckout = vi.fn()
const clearBasketCheckSnapshot = vi.fn()
let mockSelectedPaymentMethod: string | null = 'ipg'
const { track, useShowCustomerOrder } = vi.hoisted(() => ({
  track: vi.fn(),
  useShowCustomerOrder: vi.fn(),
}))

let mockSearchParams = new URLSearchParams(
  'status=success&referenceId=ORD123456',
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push, back }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('navlens', () => ({
  getPreviousPath: () => null,
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track,
  }
})

vi.mock('@/api/functions/order', () => ({
  useShowCustomerOrder,
}))

vi.mock('@/hooks/useLogout', () => ({
  useLogout: () => ({ logout: vi.fn(), isLoggingOut: false }),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({ data: undefined }),
}))

vi.mock('@/api/functions/tyche/client', () => ({
  useListClientGames: () => ({ data: undefined }),
  useGetClientBalance: () => ({ data: undefined }),
}))

vi.mock('@/api/functions/version', () => ({
  useGetVersion: () => ({ data: undefined }),
}))

vi.mock('@/api/functions/wallet-management', () => ({
  useGetPaymentProfile: () => ({ data: undefined }),
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasket: () => ({ clear: clearBasket }),
  useCheckoutData: () => ({
    checkout: { selectedPaymentMethod: mockSelectedPaymentMethod },
    clear: clearCheckout,
  }),
  useBasketCheckCall: () => ({ clear: clearBasketCheckSnapshot }),
}))

describe('PaymentResultPage', () => {
  beforeEach(() => {
    replace.mockReset()
    push.mockReset()
    back.mockReset()
    clearBasket.mockReset()
    clearCheckout.mockReset()
    clearBasketCheckSnapshot.mockReset()
    track.mockReset()
    useShowCustomerOrder.mockReset()
    useShowCustomerOrder.mockReturnValue({ data: undefined })
    mockSelectedPaymentMethod = 'ipg'

    mockSearchParams = new URLSearchParams(
      'status=success&referenceId=ORD123456',
    )
  })

  test('renders success state and clears cart, checkout, and check snapshot', () => {
    render(<PaymentResultPage />)

    expect(
      screen.getByText(PAYMENT_RESULT_COPY.success.title),
    ).toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.success.genericBody),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${PAYMENT_RESULT_COPY.success.orderNumberLabel} ${persianDigits('ORD123456')}`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.success.body),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.failed.barookName),
    ).not.toBeInTheDocument()

    expect(clearBasket).toHaveBeenCalledTimes(1)
    expect(clearCheckout).toHaveBeenCalledTimes(1)
    expect(clearBasketCheckSnapshot).toHaveBeenCalledTimes(1)
  })

  test('tracks purchase after a successful gateway return', () => {
    mockSearchParams = new URLSearchParams('status=success&referenceId=12345')
    useShowCustomerOrder.mockReturnValue({
      data: {
        order: {
          id: 12345,
          netTotal: 460_000,
          netDeliveryFee: 20_000,
          products: [
            {
              productId: 518,
              name: 'روغن سرخ کردنی 810 گرمی کم جذب بهار',
              unitInBox: 12,
              quantity: 2,
              netPrice: 3_280_000,
              discountAmount: 1_000_000,
            },
            {
              productId: 671,
              name: 'کنسرو تن ماهی 180 گرمی شیلتون',
              unitInBox: 24,
              quantity: 1,
              netPrice: 5_980_000,
              discountAmount: 100_000,
            },
          ],
        },
      },
    })

    render(<PaymentResultPage />)

    expect(track).toHaveBeenCalledWith(EVENTS.PURCHASE, {
      gtm: {
        ecommerce: {
          order_id: '12345',
          value: 460_000,
          tax: 0,
          shipping: 20_000,
          coupon: '',
          items: [
            {
              item_id: '518',
              item_name: 'روغن سرخ کردنی 810 گرمی کم جذب بهار',
              item_brand: '',
              item_category: '',
              item_variant: 'کارتن ۱۲ عددی',
              price: 3_280_000,
              quantity: 2,
              discount: 1_000_000,
              index: 0,
            },
            {
              item_id: '671',
              item_name: 'کنسرو تن ماهی 180 گرمی شیلتون',
              item_brand: '',
              item_category: '',
              item_variant: 'کارتن ۲۴ عددی',
              price: 5_980_000,
              quantity: 1,
              discount: 100_000,
              index: 1,
            },
          ],
        },
      },
    })
  })

  test('does not track purchase on a failed payment', () => {
    mockSearchParams = new URLSearchParams('status=failed&referenceId=12345')

    render(<PaymentResultPage />)

    expect(track).not.toHaveBeenCalledWith(EVENTS.PURCHASE, expect.anything())
  })

  test('does not clear cart on Barook success', () => {
    mockSearchParams = new URLSearchParams(
      'status=success&type=barook&referenceId=42',
    )

    render(<PaymentResultPage />)

    expect(
      screen.getByText(PAYMENT_RESULT_COPY.success.barookTitle),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.success.title),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.success.body),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.success.genericBody),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.success.orderNumberLabel, {
        exact: false,
      }),
    ).not.toBeInTheDocument()
    expect(clearBasket).not.toHaveBeenCalled()
    expect(clearCheckout).not.toHaveBeenCalled()
    expect(clearBasketCheckSnapshot).not.toHaveBeenCalled()
  })

  test('navigates to HOME when the success secondary button is clicked', async () => {
    const user = userEvent.setup()
    render(<PaymentResultPage />)

    await user.click(
      screen.getByRole('button', {
        name: PAYMENT_RESULT_COPY.success.secondary,
      }),
    )

    expect(replace).toHaveBeenCalledWith(ROUTES.HOME)
  })

  test('navigates to order detail when the success primary button is clicked', async () => {
    const user = userEvent.setup()
    render(<PaymentResultPage />)

    await user.click(
      screen.getByRole('button', {
        name: PAYMENT_RESULT_COPY.success.primary,
      }),
    )

    expect(replace).toHaveBeenCalledWith(ROUTES.ORDERS.detail('ORD123456'))
  })

  test('renders generic failed copy without Barook mention and does not clear cart', () => {
    mockSearchParams = new URLSearchParams('status=failed&message=ignored')

    render(<PaymentResultPage />)

    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.title),
    ).toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.line1),
    ).toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.genericLine2),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.failed.barookName),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: PAYMENT_RESULT_COPY.success.primary,
      }),
    ).not.toBeInTheDocument()

    expect(clearBasket).not.toHaveBeenCalled()
    expect(clearCheckout).not.toHaveBeenCalled()
    expect(clearBasketCheckSnapshot).not.toHaveBeenCalled()
  })

  test('renders Barook support copy on a Barook failure', () => {
    mockSearchParams = new URLSearchParams('status=failed&type=barook')

    render(<PaymentResultPage />)

    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.barookTitle),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.failed.title),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.line1),
    ).toBeInTheDocument()
    expect(
      screen.getByText(PAYMENT_RESULT_COPY.failed.barookName),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(PAYMENT_RESULT_COPY.failed.genericLine2),
    ).not.toBeInTheDocument()
  })

  test('navigates to HOME when the failed secondary button is clicked', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('status=failed')

    render(<PaymentResultPage />)

    await user.click(
      screen.getByRole('button', {
        name: PAYMENT_RESULT_COPY.failed.secondary,
      }),
    )

    expect(replace).toHaveBeenCalledWith(ROUTES.HOME)
  })

  test('navigates to CHECKOUT when "تلاش دوباره" is clicked in the failed state', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('status=failed&type=barook')

    render(<PaymentResultPage />)

    await user.click(
      screen.getByRole('button', {
        name: PAYMENT_RESULT_COPY.failed.primary,
      }),
    )

    expect(replace).toHaveBeenCalledWith(ROUTES.CHECKOUT)
  })
})
