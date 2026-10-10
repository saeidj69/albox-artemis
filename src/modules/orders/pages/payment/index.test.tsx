import { ROUTES, TOMAN } from '@/constants'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { formatPrice, toTomanPrice } from '@/utils/numbers'
import { render, screen } from '@/utils/test-utils'

import OrderPaymentPage from './index'

const push = vi.fn()
const showSheet = vi.fn()

let mockIsOrderLoading = false
let mockIsOrderError = false
let mockOrder: {
  id: number
  createdAt: string
  netTotal: number
  paymentStatus: { value: string; label: string }
} | null = {
  id: 1234567,
  createdAt: '2025-07-02T12:34:00+03:30',
  netTotal: 99_800_000,
  paymentStatus: { value: 'pending', label: 'در انتظار پرداخت' },
}

type MockTransaction = {
  id: string
  amount: number
  status: { value: string; label: string }
  source: { type: { value: string; label: string } }
  destination: { type: { value: string; label: string } }
}

let mockIsPaymentLoading = false
let mockIsPaymentError = false
let mockPayment: {
  amount: number
  pendingAmount: number
  status: { value: string; label: string }
  simplifiedTransactions: MockTransaction[]
} | null = null

const paidCodTransaction: MockTransaction = {
  id: 'tx-cod',
  amount: 30_000_000,
  status: { value: 'paid', label: 'پرداخت شده' },
  source: {
    type: { value: 'pos', label: 'پرداخت با دستگاه کارتخوان' },
  },
  destination: {
    type: { value: 'credit_company', label: 'کیف پول شرکت' },
  },
}

const pendingIpgTransaction: MockTransaction = {
  id: 'tx-ipg',
  amount: 69_800_000,
  status: { value: 'pending', label: 'در انتظار پرداخت' },
  source: {
    type: { value: 'ipg', label: 'پرداخت اینترنتی' },
  },
  destination: {
    type: { value: 'credit_company', label: 'کیف پول شرکت' },
  },
}

const createPayment = (
  overrides: Partial<NonNullable<typeof mockPayment>> = {},
): NonNullable<typeof mockPayment> => ({
  amount: 99_800_000,
  pendingAmount: 69_800_000,
  status: { value: 'pending', label: 'در انتظار پرداخت' },
  simplifiedTransactions: [paidCodTransaction],
  ...overrides,
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
  }
})

vi.mock('@/api/functions/order', () => ({
  useShowCustomerOrder: () => ({
    data: mockOrder ? { order: mockOrder } : undefined,
    isLoading: mockIsOrderLoading,
    isError: mockIsOrderError,
  }),
}))

vi.mock('@/api/functions/payment-management', () => ({
  useLatestPaymentByReference: () => ({
    data: mockPayment ? { payment: mockPayment } : undefined,
    isLoading: mockIsPaymentLoading,
    isError: mockIsPaymentError,
  }),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({
    data: { profile: { firstName: 'عباس', lastName: 'مرتضوی' } },
  }),
}))

vi.mock('@/modules/orders/utils/delivery-receipt', () => ({
  generateDeliveryReceipt: vi.fn(),
}))

describe('OrderPaymentPage', () => {
  beforeEach(() => {
    push.mockReset()
    showSheet.mockReset()
    mockIsOrderLoading = false
    mockIsOrderError = false
    mockOrder = {
      id: 1234567,
      createdAt: '2025-07-02T12:34:00+03:30',
      netTotal: 99_800_000,
      paymentStatus: { value: 'pending', label: 'در انتظار پرداخت' },
    }
    mockIsPaymentLoading = false
    mockIsPaymentError = false
    mockPayment = createPayment()
  })

  test('renders remaining amount and paid simplified transactions', () => {
    render(<OrderPaymentPage orderId={1234567} />)

    expect(screen.getByText('پرداخت')).toBeInTheDocument()
    expect(screen.getByText('روش‌های پرداخت شده')).toBeInTheDocument()
    expect(screen.getByText('پرداخت با دستگاه کارتخوان')).toBeInTheDocument()
    expect(
      screen.getByText(formatPrice(toTomanPrice(69_800_000))),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatPrice(toTomanPrice(30_000_000))),
    ).toBeInTheDocument()
  })

  test('hides pending transactions and shows empty copy when none are paid', () => {
    mockPayment = createPayment({
      simplifiedTransactions: [pendingIpgTransaction],
    })

    render(<OrderPaymentPage orderId={1234567} />)

    expect(
      screen.getByText('هنوز روش پرداختی ثبت نشده است.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('پرداخت اینترنتی')).not.toBeInTheDocument()
  })

  test('lists a paid transaction and hides a pending sibling', () => {
    mockPayment = createPayment({
      simplifiedTransactions: [paidCodTransaction, pendingIpgTransaction],
    })

    render(<OrderPaymentPage orderId={1234567} />)

    expect(screen.getByText('پرداخت با دستگاه کارتخوان')).toBeInTheDocument()
    expect(screen.queryByText('پرداخت اینترنتی')).not.toBeInTheDocument()
    expect(
      screen.queryByText('هنوز روش پرداختی ثبت نشده است.'),
    ).not.toBeInTheDocument()
  })

  test('shows error copy when latest payment fails to load', () => {
    mockIsPaymentError = true
    mockPayment = null

    render(<OrderPaymentPage orderId={1234567} />)

    expect(
      screen.getByText('اطلاعات پرداخت در دسترس نیست.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('روش‌های پرداخت شده')).not.toBeInTheDocument()
  })

  test('confirms and returns to the order detail page', async () => {
    const user = userEvent.setup()
    render(<OrderPaymentPage orderId={1234567} />)

    await user.click(screen.getByRole('button', { name: 'تایید و بازگشت' }))

    expect(push).toHaveBeenCalledWith(ROUTES.ORDERS.detail(1234567))
  })

  test('disables add-payment-method while payment status is pending', () => {
    render(<OrderPaymentPage orderId={1234567} />)

    expect(
      screen.getByRole('button', { name: 'افزودن روش پرداخت' }),
    ).toBeDisabled()
  })

  test('opens the add-payment-method sheet with the remaining amount', async () => {
    mockPayment = createPayment({
      status: { value: 'provisional_paid', label: 'پرداخت موقت' },
    })

    const user = userEvent.setup()
    render(<OrderPaymentPage orderId={1234567} />)

    await user.click(screen.getByRole('button', { name: 'افزودن روش پرداخت' }))

    expect(showSheet).toHaveBeenCalledTimes(1)
    expect(showSheet.mock.calls[0][1]).toEqual({
      orderId: 1234567,
      payableRial: 69_800_000,
    })
  })

  test('renders the fulfilled state when nothing remains to pay', () => {
    mockPayment = createPayment({
      pendingAmount: 0,
      status: { value: 'paid', label: 'پرداخت شده' },
    })

    render(<OrderPaymentPage orderId={1234567} />)

    expect(screen.getByText('پرداخت شده')).toBeInTheDocument()
    expect(screen.getByText('تکمیل شده')).toBeInTheDocument()
    expect(screen.getByText('عباس مرتضوی')).toBeInTheDocument()
    expect(screen.getByText(`0 ${TOMAN}`)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'افزودن روش پرداخت' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'دریافت رسید' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید و بازگشت' }),
    ).toBeInTheDocument()
  })
})
