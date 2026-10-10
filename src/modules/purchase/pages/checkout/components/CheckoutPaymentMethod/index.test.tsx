import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { PaymentPaymentMethod } from '@/api/models'

import {
  buildIpgCashbackAmountMessage,
  buildIpgCashbackPercentMessage,
} from './components/IpgCashbackAlert/build-ipg-cashback-messages'
import CheckoutPaymentMethod from './index'

const setSelectedPaymentMethod = vi.fn()
const track = vi.fn()

let mockIsLoading = false
let mockPaymentMethods: {
  methods?: {
    type: { value: string; label: string }
    maxAvailableAmount: number
  }[]
} | null = {
  methods: [
    {
      type: { value: PaymentPaymentMethod.ipg, label: 'پرداخت آنلاین' },
      maxAvailableAmount: 1_000_000,
    },
    {
      type: { value: PaymentPaymentMethod.cod, label: 'پرداخت در محل' },
      maxAvailableAmount: 500_000,
    },
    {
      type: { value: PaymentPaymentMethod.credit, label: 'کیف پول' },
      maxAvailableAmount: 300_000,
    },
  ],
}

let mockCheckout = {
  selectedPaymentMethod: null as string | null,
}

let mockWalletInfo = {
  isEnabled: false,
  isSufficient: false,
  deductionAmount: 0,
}

let mockBarookWallet = {
  data: undefined as { commissionPercentage: number } | undefined,
  isSuccess: false,
}

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/api/functions/payment-management', () => ({
  useGetPaymentMethods: () => ({
    data: mockPaymentMethods,
    isLoading: mockIsLoading,
  }),
}))

vi.mock('@/api/functions/barook', () => ({
  useGetBarookWallet: () => mockBarookWallet,
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketCheckCall: () => ({ data: { basket: { totalPrice: 200_000 } } }),
  useCheckoutData: () => ({
    checkout: mockCheckout,
    setSelectedPaymentMethod,
  }),
  useCheckoutWallet: () => mockWalletInfo,
}))

describe('CheckoutPaymentMethod', () => {
  beforeEach(() => {
    vi.stubEnv('CASHBACK_PERCENT', '')
    setSelectedPaymentMethod.mockReset()
    track.mockReset()
    mockIsLoading = false
    mockPaymentMethods = {
      methods: [
        {
          type: { value: PaymentPaymentMethod.ipg, label: 'پرداخت آنلاین' },
          maxAvailableAmount: 1_000_000,
        },
        {
          type: { value: PaymentPaymentMethod.cod, label: 'پرداخت در محل' },
          maxAvailableAmount: 500_000,
        },
        {
          type: { value: PaymentPaymentMethod.credit, label: 'کیف پول' },
          maxAvailableAmount: 300_000,
        },
      ],
    }
    mockCheckout = { selectedPaymentMethod: null }
    mockWalletInfo = {
      isEnabled: false,
      isSufficient: false,
      deductionAmount: 0,
    }
    mockBarookWallet = {
      data: undefined,
      isSuccess: false,
    }
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('renders skeletons when loading', () => {
    mockIsLoading = true
    const { container } = render(<CheckoutPaymentMethod />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  test('renders empty message when no non-credit payment methods exist', () => {
    mockPaymentMethods = { methods: [] }
    render(<CheckoutPaymentMethod />)
    expect(screen.getByText('روش پرداختی در دسترس نیست.')).toBeInTheDocument()
  })

  test('filters out credit payment method from options list', () => {
    render(<CheckoutPaymentMethod />)
    expect(screen.getByText('پرداخت آنلاین')).toBeInTheDocument()
    expect(screen.getByText('پرداخت در محل')).toBeInTheDocument()
    expect(screen.queryByText('کیف پول')).not.toBeInTheDocument()
  })

  test('auto-selects COD as default method when no method is selected', () => {
    render(<CheckoutPaymentMethod />)
    expect(setSelectedPaymentMethod).toHaveBeenCalledWith(
      PaymentPaymentMethod.cod,
    )
    expect(track).not.toHaveBeenCalled()
  })

  test('disables radio options when wallet is enabled and sufficient', () => {
    mockWalletInfo = {
      isEnabled: true,
      isSufficient: true,
      deductionAmount: 200_000,
    }
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.cod

    render(<CheckoutPaymentMethod />)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio).toBeDisabled()
    }
  })

  test('calls setSelectedPaymentMethod when user selects a different payment option', async () => {
    const user = userEvent.setup()
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.cod

    render(<CheckoutPaymentMethod />)

    const onlineRadio = screen.getByRole('radio', { name: /پرداخت آنلاین/i })
    await user.click(onlineRadio)

    expect(setSelectedPaymentMethod).toHaveBeenCalledWith(
      PaymentPaymentMethod.ipg,
    )
    expect(track).toHaveBeenCalledWith(EVENTS.PAYMENT_METHOD_SELECTED, {
      plausible: { method: 'payment_online' },
    })
  })

  test('tracks payment_cash_on_delivery when user selects COD', async () => {
    const user = userEvent.setup()
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg

    render(<CheckoutPaymentMethod />)

    const codRadio = screen.getByRole('radio', { name: /پرداخت در محل/i })
    await user.click(codRadio)

    expect(setSelectedPaymentMethod).toHaveBeenCalledWith(
      PaymentPaymentMethod.cod,
    )
    expect(track).toHaveBeenCalledWith(EVENTS.PAYMENT_METHOD_SELECTED, {
      plausible: { method: 'payment_cash_on_delivery' },
    })
  })

  test('shows Barook fee percent when COD is selected and wallet request succeeds', () => {
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.cod
    mockBarookWallet = {
      data: { commissionPercentage: 5 },
      isSuccess: true,
    }

    render(<CheckoutPaymentMethod />)

    const barookBanner = screen.getByText(
      'در صورت پرداخت با اعتبار باروک، ۵٪ از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.',
    )
    const codOption = screen.getByText('پرداخت در محل')
    expect(
      codOption.compareDocumentPosition(barookBanner) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  test('shows fallback Barook fee copy when COD is selected and wallet request fails', () => {
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.cod
    mockBarookWallet = {
      data: undefined,
      isSuccess: false,
    }

    render(<CheckoutPaymentMethod />)

    expect(
      screen.getByText(
        'در صورت پرداخت با اعتبار باروک، درصدی از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.',
      ),
    ).toBeInTheDocument()
  })

  test('hides Barook fee alert when IPG is selected', () => {
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg
    mockBarookWallet = {
      data: { commissionPercentage: 5 },
      isSuccess: true,
    }

    render(<CheckoutPaymentMethod />)

    expect(
      screen.queryByText(/هزینه خدمات اعتباری آل‌باکس اضافه می‌شود/),
    ).not.toBeInTheDocument()
  })

  test('shows IPG cashback percent and amount banner when env percent is set and IPG is selected', () => {
    vi.stubEnv('CASHBACK_PERCENT', '2')
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg

    render(<CheckoutPaymentMethod />)

    expect(
      screen.getByText(buildIpgCashbackPercentMessage(2)),
    ).toBeInTheDocument()
    expect(screen.getByText('(درگاه به پرداخت)')).toBeInTheDocument()
    expect(screen.queryByText('درگاه به‌پرداخت')).not.toBeInTheDocument()
    const banner = screen.getByText(buildIpgCashbackAmountMessage(4_000))
    const ipgOption = screen.getByText('(درگاه به پرداخت)')
    const codOption = screen.getByText('پرداخت در محل')
    expect(
      ipgOption.compareDocumentPosition(banner) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      banner.compareDocumentPosition(codOption) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      document.querySelector('[data-slot="ipg-cashback-badge"]'),
    ).toBeInTheDocument()
  })

  test('hides IPG cashback UI when env percent is missing or zero', () => {
    vi.stubEnv('CASHBACK_PERCENT', '0')
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg

    render(<CheckoutPaymentMethod />)

    expect(screen.getByText('درگاه به‌پرداخت')).toBeInTheDocument()
    expect(
      screen.queryByText(/به کیف پول هدیه شما برمی‌گردد/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/پس از تحویل سفارش به کیف پول هدیه شما باز می‌گردد/),
    ).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="ipg-cashback-badge"]'),
    ).not.toBeInTheDocument()
  })

  test('keeps IPG cashback percent and badge when COD is selected, but hides the amount banner', () => {
    vi.stubEnv('CASHBACK_PERCENT', '2')
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.cod

    render(<CheckoutPaymentMethod />)

    expect(
      screen.getByText(buildIpgCashbackPercentMessage(2)),
    ).toBeInTheDocument()
    expect(screen.queryByText(/با پرداخت آنلاین سفارش/)).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="ipg-cashback-badge"]'),
    ).toBeInTheDocument()
  })

  test('computes IPG cashback from remaining payable after wallet deduction', () => {
    vi.stubEnv('CASHBACK_PERCENT', '2')
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg
    mockWalletInfo = {
      isEnabled: true,
      isSufficient: false,
      deductionAmount: 50_000,
    }

    render(<CheckoutPaymentMethod />)

    expect(
      screen.getByText(buildIpgCashbackAmountMessage(3_000)),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(buildIpgCashbackAmountMessage(4_000)),
    ).not.toBeInTheDocument()
  })

  test('hides the IPG cashback amount banner when wallet covers the full basket', () => {
    vi.stubEnv('CASHBACK_PERCENT', '2')
    mockCheckout.selectedPaymentMethod = PaymentPaymentMethod.ipg
    mockWalletInfo = {
      isEnabled: true,
      isSufficient: true,
      deductionAmount: 200_000,
    }

    render(<CheckoutPaymentMethod />)

    expect(screen.queryByText(/با پرداخت آنلاین سفارش/)).not.toBeInTheDocument()
  })
})
