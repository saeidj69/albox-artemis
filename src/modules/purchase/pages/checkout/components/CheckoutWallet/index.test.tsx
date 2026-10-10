import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { PaymentPaymentMethod, PaymentWalletType } from '@/api/models'

import CheckoutWallet from './index'

const setWalletUsage = vi.fn()

let mockWalletUsage = false
let mockIsLoading = false
let mockMethods: {
  type: { value: string }
  maxAvailableAmount?: number
  breakDown?: { type: { value: string }; amount: number }[]
}[] = []

vi.mock('@/modules/purchase/hooks', () => ({
  useCheckoutData: () => ({
    checkout: { walletUsage: mockWalletUsage },
    setWalletUsage,
  }),
}))

vi.mock('@/api/functions/payment-management', () => ({
  useGetPaymentMethods: () => ({
    data: { methods: mockMethods },
    isLoading: mockIsLoading,
  }),
}))

const walletMethod = (overrides?: {
  maxAvailableAmount?: number
  breakDown?: { type: { value: string }; amount: number }[]
}) => ({
  type: { value: PaymentPaymentMethod.credit },
  maxAvailableAmount: 3_000_000,
  breakDown: [
    { type: { value: PaymentWalletType.gift }, amount: 1_000_000 },
    { type: { value: PaymentWalletType.credit }, amount: 500_000 },
    { type: { value: PaymentWalletType.barook }, amount: 1_500_000 },
  ],
  ...overrides,
})

describe('CheckoutWallet', () => {
  beforeEach(() => {
    setWalletUsage.mockReset()
    mockWalletUsage = false
    mockIsLoading = false
    mockMethods = [walletMethod()]
  })

  test('renders nothing while methods are loading is skipped and shows skeleton instead', () => {
    mockIsLoading = true
    render(<CheckoutWallet />)

    expect(screen.getByText('کیف پول:')).toBeInTheDocument()
    expect(
      screen.queryByText('کیف پول‌های آل‌باکس:', { exact: false }),
    ).not.toBeInTheDocument()
  })

  test('renders nothing when there is no wallet method or balance is zero', () => {
    mockMethods = [walletMethod({ maxAvailableAmount: 0 })]
    const { container } = render(<CheckoutWallet />)

    expect(container).toBeEmptyDOMElement()
  })

  test('renders the barook, gift and charge breakdown in order when expanded', async () => {
    mockWalletUsage = true
    const user = userEvent.setup()
    render(<CheckoutWallet />)

    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('data-state', 'checked')

    const labels = screen.getAllByText(/^\d+\. /).map((el) => el.textContent)

    expect(labels).toEqual([
      expect.stringContaining('کیف پول‌ باروک'),
      expect.stringContaining('هدیه'),
      expect.stringContaining('شارژ کیف پول'),
    ])

    await user.click(screen.getByText('کیف پول‌های آل‌باکس:', { exact: false }))
    expect(setWalletUsage).toHaveBeenCalledWith(false)
  })

  test('toggling the switch does not double-fire the row click handler', async () => {
    const user = userEvent.setup()
    render(<CheckoutWallet />)

    await user.click(screen.getByRole('switch'))

    expect(setWalletUsage).toHaveBeenCalledTimes(1)
    expect(setWalletUsage).toHaveBeenCalledWith(true)
  })
})
