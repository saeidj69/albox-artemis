import { ROUTES } from '@/constants'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import CheckoutDeliveryInfo from './index'

const push = vi.fn()

let mockSelectedTimeSlotId: number | null = 55
let mockPrimaryAddress: { name: string; address: string } | null = {
  name: 'Home',
  address: 'Tehran, Street 1',
}
let mockIsAddressLoading = false
let mockIsTimeslotLoading = false
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useUserAddresses: () => ({
    primaryAddress: mockPrimaryAddress,
    isLoading: mockIsAddressLoading,
  }),
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useCheckoutData: () => ({
    checkout: { selectedTimeSlotId: mockSelectedTimeSlotId },
  }),
  useBasketCheckCall: () => ({
    data: mockBasketData,
    isChecking: mockIsTimeslotLoading,
  }),
}))

describe('CheckoutDeliveryInfo', () => {
  beforeEach(() => {
    push.mockReset()
    mockSelectedTimeSlotId = 55
    mockPrimaryAddress = { name: 'Home', address: 'Tehran, Street 1' }
    mockIsAddressLoading = false
    mockIsTimeslotLoading = false
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

  test('renders skeletons when address or timeslot is loading', () => {
    mockIsAddressLoading = true
    const { container } = render(<CheckoutDeliveryInfo />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  test('renders primary address title and text', () => {
    render(<CheckoutDeliveryInfo />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Tehran, Street 1')).toBeInTheDocument()
  })

  test('renders prompt to add address when primary address is missing', async () => {
    const user = userEvent.setup()
    mockPrimaryAddress = null

    render(<CheckoutDeliveryInfo />)

    expect(screen.getByText('آدرس تحویل انتخاب نشده است')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'افزودن آدرس' })
    await user.click(btn)

    expect(push).toHaveBeenCalledWith(expect.stringContaining('/address'))
  })

  test('renders formatted delivery timeslot info when timeslot option exists', () => {
    render(<CheckoutDeliveryInfo />)
    expect(screen.getByText(/ساعت/)).toBeInTheDocument()
  })

  test('redirects to /basket if selectedTimeSlotId is missing/null', () => {
    mockSelectedTimeSlotId = null
    render(<CheckoutDeliveryInfo />)
    expect(push).toHaveBeenCalledWith(ROUTES.BASKET)
  })
})
