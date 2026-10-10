import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import WalletPage from './index'

const push = vi.fn()

let mockProfileData:
  | {
      totalAmount: number
      amounts: {
        type: { value: string }
        amount: number
        spendableAmount: number
      }[]
    }
  | undefined

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/api/functions/wallet-management', () => ({
  useGetPaymentProfile: (options: {
    query: {
      select: (data: typeof mockProfileData) => unknown
    }
  }) => ({
    data: mockProfileData ? options.query.select(mockProfileData) : undefined,
  }),
}))

describe('WalletPage', () => {
  test('renders skeletons while the payment profile has not loaded', () => {
    mockProfileData = undefined

    const { container } = render(<WalletPage />)

    expect(
      container.querySelector('[data-slot="balance-card-skeleton"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="barook-wallet-card-skeleton"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelectorAll('[data-slot="wallet-type-card-skeleton"]'),
    ).toHaveLength(2)
    expect(screen.queryByText('شارژ کیف پول')).not.toBeInTheDocument()
    expect(screen.queryByText('کیف پول باروک')).not.toBeInTheDocument()
  })

  test('renders wallet amounts from payment profile', () => {
    mockProfileData = {
      totalAmount: 3_500_000,
      amounts: [
        {
          type: { value: 'credit' },
          amount: 1_000_000,
          spendableAmount: 1_000_000,
        },
        { type: { value: 'gift' }, amount: 500_000, spendableAmount: 500_000 },
        {
          type: { value: 'barook' },
          amount: 2_000_000,
          spendableAmount: 1_000_000,
        },
      ],
    }

    const { container } = render(<WalletPage />)

    expect(
      container.querySelector('[data-slot="balance-card-amount"]'),
    ).toHaveTextContent('۳۵۰٬۰۰۰')
    expect(screen.getByText('شارژ کیف پول')).toBeInTheDocument()
    expect(screen.getByText('هدیه')).toBeInTheDocument()
    expect(screen.getByText('کیف پول باروک')).toBeInTheDocument()

    const walletTypeAmounts = container.querySelectorAll(
      '[data-slot="wallet-type-card-amount"]',
    )
    expect(walletTypeAmounts[0]).toHaveTextContent('۱۰۰٬۰۰۰')
    expect(walletTypeAmounts[1]).toHaveTextContent('۵۰٬۰۰۰')
    expect(
      container.querySelector('[data-slot="barook-wallet-card-balance"]'),
    ).toHaveTextContent('۲۰۰٬۰۰۰')
    expect(
      container.querySelector('[data-slot="barook-wallet-card-usable-amount"]'),
    ).toHaveTextContent('۱۰۰٬۰۰۰')
  })

  test('hides the barook card when the profile has no barook wallet entry', () => {
    mockProfileData = {
      totalAmount: 1_500_000,
      amounts: [
        {
          type: { value: 'credit' },
          amount: 1_000_000,
          spendableAmount: 1_000_000,
        },
        { type: { value: 'gift' }, amount: 500_000, spendableAmount: 500_000 },
      ],
    }

    render(<WalletPage />)

    expect(screen.queryByText('کیف پول باروک')).not.toBeInTheDocument()
  })

  test('hides the barook card when barook amount is 0', () => {
    mockProfileData = {
      totalAmount: 1_500_000,
      amounts: [
        {
          type: { value: 'credit' },
          amount: 1_000_000,
          spendableAmount: 1_000_000,
        },
        { type: { value: 'gift' }, amount: 500_000, spendableAmount: 500_000 },
        {
          type: { value: 'barook' },
          amount: 0,
          spendableAmount: 1_000_000,
        },
      ],
    }

    render(<WalletPage />)

    expect(screen.queryByText('کیف پول باروک')).not.toBeInTheDocument()
  })

  test('hides the barook card when barook spendable amount is 0', () => {
    mockProfileData = {
      totalAmount: 3_500_000,
      amounts: [
        {
          type: { value: 'credit' },
          amount: 1_000_000,
          spendableAmount: 1_000_000,
        },
        { type: { value: 'gift' }, amount: 500_000, spendableAmount: 500_000 },
        {
          type: { value: 'barook' },
          amount: 2_000_000,
          spendableAmount: 0,
        },
      ],
    }

    render(<WalletPage />)

    expect(screen.queryByText('کیف پول باروک')).not.toBeInTheDocument()
  })
})
