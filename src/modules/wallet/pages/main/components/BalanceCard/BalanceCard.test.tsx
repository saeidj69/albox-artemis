import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BalanceCard from './index'

describe('BalanceCard', () => {
  test('renders balance converted to toman', () => {
    render(<BalanceCard balance={12_345_670} />)

    expect(screen.getByText('۱٬۲۳۴٬۵۶۷')).toBeInTheDocument()
    expect(screen.getByText('تومان')).toBeInTheDocument()
  })

  test('renders a same-size skeleton with fill slot', () => {
    const { container } = render(<BalanceCard.Skeleton />)

    expect(
      container.querySelector('[data-slot="balance-card-skeleton"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="balance-card-skeleton-fill"]'),
    ).toBeInTheDocument()
  })
})
