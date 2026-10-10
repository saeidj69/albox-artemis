import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BarookWalletCard from './index'

describe('BarookWalletCard', () => {
  test('renders amount and spendable amount converted to toman', () => {
    render(<BarookWalletCard amount={12_345_670} spendableAmount={9_876_540} />)

    expect(screen.getByText('کیف پول باروک')).toBeInTheDocument()
    expect(screen.getByText('۱٬۲۳۴٬۵۶۷')).toBeInTheDocument()
    expect(screen.getByText('۹۸۷٬۶۵۴')).toBeInTheDocument()
  })

  test('renders skeleton slots matching the card layout', () => {
    const { container } = render(<BarookWalletCard.Skeleton />)

    expect(
      container.querySelector('[data-slot="barook-wallet-card-skeleton"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="barook-wallet-card-skeleton-icon"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="barook-wallet-card-skeleton-title"]',
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="barook-wallet-card-skeleton-balance"]',
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="barook-wallet-card-skeleton-usable-amount"]',
      ),
    ).toBeInTheDocument()
  })
})
