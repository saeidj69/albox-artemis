import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import CheckoutPriceOverview from './index'

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketCheckCall: () => ({
    data: {
      basket: {
        products: [{ status: 'ok', quantity: 2 }],
        totalProductsPriceWithoutDiscount: 5_000_000,
        totalProductsDiscount: 500_000,
        totalCashbackAmount: 1_230_000,
        netDeliveryFee: 100_000,
      },
    },
    isChecking: false,
  }),
  useCheckoutWallet: () => ({ deductionAmount: 0 }),
}))

describe('CheckoutPriceOverview', () => {
  test('shows basket-check total cashback in tomans', () => {
    render(<CheckoutPriceOverview />)

    const cashbackLabel = screen.getByText('بازگشت اعتبار:')
    const cashbackRow = cashbackLabel.closest('[data-slot="price-row"]')

    expect(cashbackRow).toHaveTextContent('۱۲۳٬۰۰۰ تومان')
    expect(cashbackRow?.querySelector('.text-primary-600')).toHaveTextContent(
      '۱۲۳٬۰۰۰',
    )
  })
})
