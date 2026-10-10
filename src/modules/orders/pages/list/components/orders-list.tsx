'use client'

import { useCallback, useEffect } from 'react'

import { useClientState } from '@/hooks/useClientState'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import { parseOrderIdSearch } from '@/modules/orders/utils/order-search'

import { useListCustomerOrdersInfinite } from '@/api/functions/order'
import type { OrderCustomerOrder } from '@/api/models'

import FlatList from '@/lib/FlatList'

import EmptyOrders from './empty-orders'
import EmptyOrdersSearch from './empty-orders-search'
import OrderCard from './order-card'
import OrderCardSkeleton from './order-card.skeleton'

const ORDERS_PER_PAGE = 20

const OrdersList = ({ orderSearch }: { orderSearch: string }) => {
  const {
    value: addToCartPreviewClientState,
    setValue: setAddToCartPreviewClientState,
  } = useClientState('addToCartPreview')

  const [animationParent] = useAutoAnimate<HTMLDivElement>()

  const orderId = parseOrderIdSearch(orderSearch)

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useListCustomerOrdersInfinite(
      {
        limit: ORDERS_PER_PAGE,
        orderId,
      },
      {
        query: {
          select: (pages) => {
            const orders = pages.pages.flatMap((page) => page?.orders ?? [])

            const lastCursor =
              pages.pages[pages.pages.length - 1]?.metadata?.nextCursor

            return { orders, hasMore: lastCursor != null }
          },
          getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor,
          staleTime: 1000 * 60 * 5,
        },
      },
    )

  const orders = data?.orders ?? []
  const hasMore = data?.hasMore ?? false

  useEffect(() => {
    if (orders.length === 0 || addToCartPreviewClientState?.ordersCount) return

    setAddToCartPreviewClientState({
      lastTimestamp: Date.now(),
      ordersCount: orders.length,
    })
  }, [orders.length, addToCartPreviewClientState?.ordersCount])

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) fetchNextPage()
  }, [fetchNextPage, hasMore, isFetchingNextPage])

  const renderItem = useCallback(
    (order: OrderCustomerOrder) => <OrderCard order={order} />,
    [],
  )

  const renderSkeleton = useCallback(() => <OrderCardSkeleton />, [])

  return (
    <FlatList
      nodeRef={animationParent}
      data={orders}
      emptyContent={
        orderSearch.trim() ? <EmptyOrdersSearch /> : <EmptyOrders />
      }
      loading={isLoading}
      skeletonCount={4}
      itemKey="id"
      renderItem={renderItem}
      renderSkeleton={renderSkeleton}
      className="grid gap-3"
      infiniteOptions={{
        hasMore,
        onLoadMore: handleLoadMore,
        loadingMore: isFetchingNextPage,
        loadingMoreSkeletonCount: 2,
      }}
    />
  )
}

export default OrdersList
