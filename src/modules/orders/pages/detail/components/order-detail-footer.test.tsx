import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import OrderDetailFooter from './order-detail-footer'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

const approveOrder = vi.fn()
const cancelOrder = vi.fn()

let mockOrder: {
  id: number
  status: { value: string }
  paymentStatus: { value: string }
  address: { id: number; address: string }
  products: { quantity: number }[]
  netDeliveryFee: number
  totalProductsPrice: number
  totalDiscountAmount: number
  netTotal: number
} | null = {
  id: 42,
  status: { value: 'pending_customer_approval' },
  paymentStatus: { value: 'paid' },
  address: { id: 7, address: 'Tehran, Street 1' },
  products: [{ quantity: 1 }],
  netDeliveryFee: 0,
  totalProductsPrice: 100_000,
  totalDiscountAmount: 0,
  netTotal: 100_000,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  }
})

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({
    data: { profile: { isImpersonating: false } },
  }),
}))

vi.mock('@/api/functions/order', () => ({
  getShowCustomerOrderQueryKey: (orderId: number) => ['order', orderId],
  useShowCustomerOrder: () => ({ data: { order: mockOrder } }),
  useCustomerApproveOrder: () => ({
    mutate: approveOrder,
    isPending: false,
  }),
  useCustomerCancelOrder: () => ({
    mutate: cancelOrder,
    isPending: false,
  }),
}))

vi.mock('@/components/Layout', () => ({
  default: {
    Footer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
}))

vi.mock('@/lib/Sheet', () => ({
  showSheet: vi.fn(),
  hideSheet: vi.fn(),
  createSheet: (component: unknown) => component,
}))

vi.mock('../utils/add-order-products-to-basket', () => ({
  useAddOrderProductsToBasket: () => vi.fn(),
}))

describe('OrderDetailFooter', () => {
  beforeEach(() => {
    approveOrder.mockReset()
    cancelOrder.mockReset()
    mockOrder = {
      id: 42,
      status: { value: 'pending_customer_approval' },
      paymentStatus: { value: 'paid' },
      address: { id: 7, address: 'Tehran, Street 1' },
      products: [{ quantity: 1 }],
      netDeliveryFee: 0,
      totalProductsPrice: 100_000,
      totalDiscountAmount: 0,
      netTotal: 100_000,
    }
  })

  test('calls approveOrder with the order id', async () => {
    const user = userEvent.setup()

    render(<OrderDetailFooter orderId={42} />)

    await user.click(screen.getByRole('button', { name: 'تایید' }))

    expect(approveOrder).toHaveBeenCalledWith({ orderId: 42 })
  })
})
