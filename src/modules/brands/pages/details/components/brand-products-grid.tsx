'use client'

import { useCallback, useMemo } from 'react'

import { useProductListTracking } from '@/hooks/useProductListTracking'

import Animate from '@/components/Animate'
import ProductCard from '@/components/ProductCard'
import VisibilityTracker from '@/components/VisibilityTracker'

import { useLocation } from '@/modules/addresses/hooks'

import { useSearchProductsListingInfinite } from '@/api/functions/catalogue'
import { ListingProductSort, ListingProductSummary } from '@/api/models'

import FlatList from '@/lib/FlatList'

const PRODUCTS_PAGE_SIZE = 20

type BrandProductsGridProps = {
  brandId: number
  categoryId?: number | null
  sort?: ListingProductSort
}

const BrandProductsGrid = ({
  brandId,
  categoryId,
  sort = 'popularity:desc',
}: BrandProductsGridProps) => {
  const { location, isLoading: isLocationLoading } = useLocation()
  const {
    data: productsData,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearchProductsListingInfinite(
    {
      brands: [brandId],
      ...(categoryId ? { categories: [categoryId] } : {}),
      limit: PRODUCTS_PAGE_SIZE,
      sort,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: !isLocationLoading,
        getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor,
      },
    },
  )

  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page?.products ?? []) ?? [],
    [productsData],
  )

  const pages = productsData?.pages
  const hasMore = pages?.length
    ? (pages[pages.length - 1]?.metadata?.nextCursor ?? null) !== null
    : false

  const onLoadMore = useCallback(() => {
    if (hasMore) void fetchNextPage()
  }, [fetchNextPage, hasMore])

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: `brand-${brandId}`,
    itemListName: 'brand',
  })

  const renderItem = useCallback(
    (product: ListingProductSummary, index: number) => {
      return (
        <Animate animation="slideUp" delay={(index % PRODUCTS_PAGE_SIZE) * 20}>
          <VisibilityTracker
            threshold={1}
            triggerOnce
            onChange={(inView) => {
              if (inView) onProductVisible(product, index)
            }}
          >
            <ProductCard
              product={product}
              onProductOpen={() => onProductOpen(product, index)}
            />
          </VisibilityTracker>
        </Animate>
      )
    },
    [onProductVisible, onProductOpen],
  )

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate animation="slideUp" delay={index * 20}>
        <ProductCard.Skeleton />
      </Animate>
    )
  }, [])

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <FlatList
          fragment
          itemKey="id"
          data={products}
          skeletonCount={6}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          loading={isLoading || isLocationLoading}
          emptyContent={
            <p className="typo-body-medium text-text-secondary col-span-full py-8 text-center">
              محصولی از این برند پیدا نشد
            </p>
          }
          infiniteOptions={{
            hasMore,
            onLoadMore,
            loadingMore: isFetchingNextPage,
            loadingMoreSkeletonCount: 4,
          }}
        />
      </div>
    </section>
  )
}

export default BrandProductsGrid
