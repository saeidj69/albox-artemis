import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import OrdersList from './orders-list'

const useListCustomerOrdersInfinite = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/useClientState', () => ({
  useClientState: () => ({ value: undefined, setValue: vi.fn() }),
}))

vi.mock('@/api/functions/order', () => ({
  useListCustomerOrdersInfinite: (...args: unknown[]) =>
    useListCustomerOrdersInfinite(...args),
}))

vi.mock('./order-card', () => ({
  default: ({ order }: { order: { id: number } }) => (
    <div>order-{order.id}</div>
  ),
}))

vi.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: () => [null],
}))

vi.mock('@/lib/FlatList', () => ({
  default: ({
    data = [],
    renderItem,
    emptyContent,
  }: {
    data?: unknown[]
    renderItem: (item: unknown) => React.ReactNode
    emptyContent?: React.ReactNode
  }) =>
    data.length === 0 ? (
      <>{emptyContent}</>
    ) : (
      <>
        {data.map((item, index) => (
          <div key={index}>{renderItem(item)}</div>
        ))}
      </>
    ),
}))

const ordersResult = (ids: number[]) => ({
  data: { orders: ids.map((id) => ({ id })), hasMore: false },
  isLoading: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
})

const NO_ORDERS_TITLE = 'هنوز سفارشی ثبت نشده است.'
const NO_MATCH_TITLE = 'سفارشی مطابق با فیلتر شما پیدا نشد.'

describe('OrdersList', () => {
  beforeEach(() => {
    useListCustomerOrdersInfinite.mockReset()
    useListCustomerOrdersInfinite.mockReturnValue(ordersResult([]))
  })

  test('renders matching orders for a numeric search', () => {
    useListCustomerOrdersInfinite.mockReturnValue(ordersResult([1234]))

    render(<OrdersList orderSearch="۱۲۳۴" />)

    expect(useListCustomerOrdersInfinite).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 1234 }),
      expect.anything(),
    )
    expect(screen.getByText('order-1234')).toBeInTheDocument()
  })

  test('shows the no-match empty state when a search returns nothing', () => {
    render(<OrdersList orderSearch="999" />)

    expect(screen.getByText(NO_MATCH_TITLE)).toBeInTheDocument()
    expect(screen.queryByText(NO_ORDERS_TITLE)).not.toBeInTheDocument()
  })

  test('shows the no-match empty state for a non-numeric search too', () => {
    render(<OrdersList orderSearch="abc" />)

    expect(screen.getByText(NO_MATCH_TITLE)).toBeInTheDocument()
    expect(screen.queryByText(NO_ORDERS_TITLE)).not.toBeInTheDocument()
  })

  test('shows the first-order empty state when there is no search', () => {
    render(<OrdersList orderSearch="" />)

    expect(screen.getByText(NO_ORDERS_TITLE)).toBeInTheDocument()
    expect(screen.queryByText(NO_MATCH_TITLE)).not.toBeInTheDocument()
  })
})
