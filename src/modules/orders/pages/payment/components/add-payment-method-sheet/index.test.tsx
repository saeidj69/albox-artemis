import { BAROOK_CREDIT_URL, ERROR_CODES, ROUTES } from '@/constants'
import userEvent from '@testing-library/user-event'
import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { act, render, screen } from '@/utils/test-utils'

import type { PaymentBarookWalletDetails } from '@/api/models'

import { AddPaymentMethodSheetComponent } from './index'

const hide = vi.fn()
const push = vi.fn()
const discover = vi.fn()
const navigateToExternalUrl = vi.fn()

let mockIsWalletLoading = false
let mockIsDiscovering = false
let mockWallet: PaymentBarookWalletDetails | undefined
let mockWalletError: unknown
let mockDiscoverOnError: ((error: unknown) => void) | undefined
let mockDiscoverOnMutate: (() => void) | undefined
let mockDiscoverOnSettled: (() => void) | undefined
let mockDiscoverOnSuccess: ((data: { discovered: boolean }) => void) | undefined

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/Sheet', () => ({
  createSheet: (component: unknown) => component,
  useSheet: () => ({ hide }),
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/modules/payment/utils/payment-navigation', () => ({
  buildOrderPayUrl: (orderId: number) => `https://api.test/pay/${orderId}`,
  navigateToExternalUrl: (...args: unknown[]) => navigateToExternalUrl(...args),
}))

vi.mock('@/api/functions/barook', () => ({
  getGetBarookWalletQueryKey: () => ['barook-wallet'],
  useGetBarookWallet: () => ({
    data: mockWallet,
    isLoading: mockIsWalletLoading,
    error: mockWalletError,
  }),
  useDiscoverBarookCustomer: (options?: {
    mutation?: {
      onMutate?: () => void
      onSuccess?: (data: { discovered: boolean }) => void
      onError?: (error: unknown) => void
      onSettled?: () => void
    }
  }) => {
    mockDiscoverOnMutate = options?.mutation?.onMutate
    mockDiscoverOnSuccess = options?.mutation?.onSuccess
    mockDiscoverOnError = options?.mutation?.onError
    mockDiscoverOnSettled = options?.mutation?.onSettled
    return {
      mutate: () => {
        mockDiscoverOnMutate?.()
        discover()
      },
      isPending: mockIsDiscovering,
    }
  },
}))

const activeWallet = (): PaymentBarookWalletDetails => ({
  enabled: true,
  balance: 200_000_000,
  commissionPercentage: 1,
  maxAffordablePrincipal: 1000,
  remote: {
    expendableCreditAmount: 1,
    balanceDate: null,
    isUserBlocked: false,
  },
})

const axiosError = (args: {
  status?: number
  code?: number
  retryAfter?: string
}) => {
  const headers: Record<string, string> = {}
  if (args.retryAfter != null) headers['retry-after'] = args.retryAfter

  return new AxiosError(
    'request failed',
    undefined,
    {} as InternalAxiosRequestConfig,
    undefined,
    {
      status: args.status ?? 500,
      data: args.code != null ? { code: args.code } : {},
      headers,
      statusText: '',
      config: {} as InternalAxiosRequestConfig,
    } as AxiosResponse,
  )
}

describe('AddPaymentMethodSheet', () => {
  beforeEach(() => {
    hide.mockReset()
    push.mockReset()
    discover.mockReset()
    navigateToExternalUrl.mockReset()
    mockIsWalletLoading = false
    mockIsDiscovering = false
    mockWallet = activeWallet()
    mockWalletError = undefined
    mockDiscoverOnError = undefined
    mockDiscoverOnMutate = undefined
    mockDiscoverOnSettled = undefined
    mockDiscoverOnSuccess = undefined
  })

  test('renders checking-credit status while the wallet query is loading', () => {
    mockIsWalletLoading = true
    mockWallet = undefined

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    expect(
      screen.getByText('در حال بررسی اعتبار باروک شما...'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'انتخاب روش پرداخت' }),
    ).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: /پرداخت با اعتبار باروک/ }),
    ).not.toBeInTheDocument()
  })

  test('defaults to IPG so confirm is enabled without selecting', async () => {
    const user = userEvent.setup()
    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    const confirm = screen.getByRole('button', { name: 'انتخاب روش پرداخت' })
    expect(confirm).toBeEnabled()

    await user.click(confirm)

    expect(hide).toHaveBeenCalledTimes(1)
    expect(navigateToExternalUrl).toHaveBeenCalledWith(
      'https://api.test/pay/42',
    )
  })

  test('selecting active Barook confirms into the Barook calculator', async () => {
    const user = userEvent.setup()
    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /پرداخت با اعتبار باروک/ }),
    )
    await user.click(screen.getByRole('button', { name: 'انتخاب روش پرداخت' }))

    expect(hide).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith(ROUTES.PAYMENT.barook(42))
  })

  test('renders unknown for 5024 and retries via discover', async () => {
    const user = userEvent.setup()
    mockWallet = undefined
    mockWalletError = axiosError({
      status: 404,
      code: ERROR_CODES.BAROOK_WALLET_NOT_FOUND,
    })

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    expect(screen.getByText('وضعیت اعتبار: نامشخص')).toBeInTheDocument()
    expect(screen.queryByText('غیرفعال')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /پرداخت با اعتبار باروک/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'بررسی وضعیت اعتبار' }))
    expect(discover).toHaveBeenCalledTimes(1)

    await act(async () => {
      mockDiscoverOnSuccess?.({ discovered: false })
      mockDiscoverOnSettled?.()
    })

    expect(screen.getByText('غیرفعال')).toBeInTheDocument()
    expect(screen.getByText('اعتبار باروک شما فعال نیست')).toBeInTheDocument()
    expect(screen.queryByText('وضعیت اعتبار: نامشخص')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'انتخاب روش پرداخت' }),
    ).toBeEnabled()
  })

  test('renders inactive when the wallet is disabled', () => {
    mockWallet = { ...activeWallet(), enabled: false }

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    expect(screen.getByText('غیرفعال')).toBeInTheDocument()
    expect(screen.getByText('اعتبار باروک شما فعال نیست')).toBeInTheDocument()

    const getCredit = screen.getByRole('link', { name: 'دریافت اعتبار' })
    expect(getCredit).toHaveAttribute('href', BAROOK_CREDIT_URL)
    expect(getCredit).toHaveAttribute('target', '_blank')
  })

  test('renders provider error for 5029/5030 and retries via discover', async () => {
    const user = userEvent.setup()
    mockWallet = undefined
    mockWalletError = axiosError({
      status: 503,
      code: ERROR_CODES.BAROOK_PROVIDER_UNAVAILABLE,
    })

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    expect(
      screen.getByText('بررسی اعتبار با خطا مواجه شد. لطفا دوباره تلاش کنید.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('خطا در برقراری ارتباط با سرورهای باروک.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'تلاش مجدد' }))
    expect(discover).toHaveBeenCalledTimes(1)
  })

  test('renders rate-limit message without a countdown and keeps IPG confirm', async () => {
    const user = userEvent.setup()
    mockWallet = activeWallet()

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    await act(async () => {
      mockDiscoverOnError?.(axiosError({ status: 429 }))
    })

    expect(
      screen.getByText('تعداد درخواست‌ها بیش از حد مجاز است.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('لطفاً کمی بعد دوباره تلاش کنید.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/دقیقه دیگر/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'انتخاب روش پرداخت' }))
    expect(navigateToExternalUrl).toHaveBeenCalledWith(
      'https://api.test/pay/42',
    )
  })

  test('renders unknown credit status and checks it via discover', async () => {
    const user = userEvent.setup()
    mockWallet = { ...activeWallet(), remote: null }

    render(
      <AddPaymentMethodSheetComponent
        orderId={42}
        payableRial={9_000_000_000}
      />,
    )

    expect(screen.getByText('وضعیت اعتبار: نامشخص')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'بررسی وضعیت اعتبار' }))
    expect(discover).toHaveBeenCalledTimes(1)
  })
})
