import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import WalletTypeCard from './index'

describe('WalletTypeCard', () => {
  test('renders title, icon, and amount converted to toman', () => {
    render(
      <WalletTypeCard
        index={0}
        title="شارژ کیف پول"
        amount={1_000_000}
        icon={<span data-testid="wallet-type-icon" />}
      />,
    )

    expect(screen.getByText('شارژ کیف پول')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-type-icon')).toBeInTheDocument()
    expect(screen.getByText('۱۰۰٬۰۰۰')).toBeInTheDocument()
    expect(screen.getByText('تومان')).toBeInTheDocument()
  })

  test('renders skeleton slots matching the card layout', () => {
    const { container } = render(<WalletTypeCard.Skeleton />)

    expect(
      container.querySelector('[data-slot="wallet-type-card-skeleton"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="wallet-type-card-skeleton-icon"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="wallet-type-card-skeleton-title"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="wallet-type-card-skeleton-amount"]'),
    ).toBeInTheDocument()
  })
})
