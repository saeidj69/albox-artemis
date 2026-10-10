import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { PaymentPaymentMethod, PaymentWalletType } from '@/api/models'

import { useCheckoutWallet } from './use-checkout-wallet'

let mockPaymentMethods: {
  methods?: {
    type: { value: string }
    maxAvailableAmount: number
    breakDown?: { type: { value: string }; amount: number }[]
  }[]
} | null = null

let mockBasketTotal = 200_000
let mockWalletUsage = true

vi.mock('@/api/functions/payment-management', () => ({
  useGetPaymentMethods: () => ({ data: mockPaymentMethods, isLoading: false }),
}))

vi.mock('./use-basket-check-call', () => ({
  useBasketCheckCall: () => ({
    data: { basket: { totalPrice: mockBasketTotal } },
  }),
}))

vi.mock('./use-checkout-data', () => ({
  useCheckoutData: () => ({
    checkout: { walletUsage: mockWalletUsage },
    setWalletUsage: vi.fn(),
  }),
}))

describe('useCheckoutWallet', () => {
  beforeEach(() => {
    mockPaymentMethods = {
      methods: [
        {
          type: { value: PaymentPaymentMethod.credit },
          maxAvailableAmount: 500_000,
          breakDown: [
            { type: { value: PaymentWalletType.gift }, amount: 200_000 },
            { type: { value: PaymentWalletType.credit }, amount: 300_000 },
          ],
        },
      ],
    }
    mockBasketTotal = 200_000
    mockWalletUsage = true
  })

  it('calculates wallet totals correctly when balance covers basket total', () => {
    const { result } = renderHook(() => useCheckoutWallet())

    expect(result.current.hasBalance).toBe(true)
    expect(result.current.totalAmount).toBe(500_000)
    expect(result.current.giftAmount).toBe(200_000)
    expect(result.current.chargeAmount).toBe(300_000)
    expect(result.current.isSufficient).toBe(true)
    expect(result.current.isEnabled).toBe(true)
    expect(result.current.deductionAmount).toBe(200_000)
  })

  it('calculates partial deduction when totalAmount is less than basketTotal', () => {
    mockBasketTotal = 800_000

    const { result } = renderHook(() => useCheckoutWallet())

    expect(result.current.isSufficient).toBe(false)
    expect(result.current.deductionAmount).toBe(500_000)
  })

  it('returns deductionAmount 0 when wallet usage is disabled by user', () => {
    mockWalletUsage = false

    const { result } = renderHook(() => useCheckoutWallet())

    expect(result.current.isEnabled).toBe(false)
    expect(result.current.deductionAmount).toBe(0)
  })

  it('returns hasBalance false when credit payment method is missing or total is 0', () => {
    mockPaymentMethods = { methods: [] }

    const { result } = renderHook(() => useCheckoutWallet())

    expect(result.current.hasBalance).toBe(false)
    expect(result.current.isEnabled).toBe(false)
    expect(result.current.deductionAmount).toBe(0)
  })
})
