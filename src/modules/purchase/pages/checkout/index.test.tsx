import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import CheckoutPage from './index'

const track = vi.fn()

let mockSelectedTimeSlotId: number | null = 55
let mockIsChecking = false
let mockIsWalletLoading = false
let mockHasBalance = true
let mockBasketData: {
  basket?: {
    timeslotOptions?: {
      id: number
      deliveryDate: string
      deliveryStartTime: string
      deliveryEndTime: string
    }[]
  }
} | null = {
  basket: {
    timeslotOptions: [
      {
        id: 55,
        deliveryDate: '2026-08-02',
        deliveryStartTime: '10:00:00',
        deliveryEndTime: '12:00:00',
      },
    ],
  },
}

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketRemoteSync: () => undefined,
  useAutoBasketCheck: () => undefined,
  useCheckoutData: () => ({
    checkout: { selectedTimeSlotId: mockSelectedTimeSlotId },
  }),
  useBasketCheckCall: () => ({
    data: mockBasketData,
    isChecking: mockIsChecking,
  }),
  useCheckoutWallet: () => ({
    hasBalance: mockHasBalance,
    isLoading: mockIsWalletLoading,
  }),
}))

vi.mock('@/components/Header', () => ({
  default: () => null,
  HeaderLogo: () => null,
}))
vi.mock('@/components/Header/components/HeaderBackButton', () => ({
  default: () => null,
}))
vi.mock('@/components/Layout', () => ({
  default: { Header: () => null },
}))
vi.mock('./components/CheckoutComment', () => ({ default: () => null }))
vi.mock('./components/CheckoutDeliveryInfo', () => ({ default: () => null }))
vi.mock('./components/CheckoutFooter', () => ({ default: () => null }))
vi.mock('./components/CheckoutPaymentMethod', () => ({ default: () => null }))
vi.mock('./components/CheckoutWallet', () => ({ default: () => null }))

describe('CheckoutPage view tracking', () => {
  beforeEach(() => {
    track.mockReset()
    mockSelectedTimeSlotId = 55
    mockIsChecking = false
    mockIsWalletLoading = false
    mockHasBalance = true
    mockBasketData = {
      basket: {
        timeslotOptions: [
          {
            id: 55,
            deliveryDate: '2026-08-02',
            deliveryStartTime: '10:00:00',
            deliveryEndTime: '12:00:00',
          },
        ],
      },
    }
  })

  test('tracks view_checkout after the timeslot check with wallet and timeslot', () => {
    render(<CheckoutPage />)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CHECKOUT, {
      webengage: {
        wallet_has_balance: 1,
        timeslot: expect.stringMatching(/۱۰:00.*۱۲:00/),
      },
    })
  })

  test('does not track view_checkout while the timeslot check is in flight', () => {
    mockIsChecking = true

    render(<CheckoutPage />)

    expect(track).not.toHaveBeenCalled()
  })

  test('does not track view_checkout when no timeslot is selected', () => {
    mockSelectedTimeSlotId = null

    render(<CheckoutPage />)

    expect(track).not.toHaveBeenCalled()
  })
})
