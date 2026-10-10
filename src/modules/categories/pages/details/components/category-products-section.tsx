'use client'

import { useCallback, useMemo } from 'react'

import { useProductListTracking } from '@/hooks/useProductListTracking'

import Animate from '@/components/Animate'
import ProductCard from '@/components/ProductCard'
import VisibilityTracker from '@/components/VisibilityTracker'

import { useLocation } from '@/modules/addresses/hooks'

import { useSearchProductsListingInfinite } from '@/api/functions/catalogue'
import { ListingProductSummary } from '@/api/models'

import FlatList from '@/lib/FlatList'
import {
  buildSearchProductsListingParamsFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

const PRODUCTS_PAGE_SIZE = 20

type CategoryProductsSectionProps = {
  categoryId: number
  searchParams: ListingFiltersRouteSearchParams
}

const CategoryProductsSection = (props: CategoryProductsSectionProps) => {
  const { categoryId, searchParams } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const apiParams = useMemo(
    () =>
      buildSearchProductsListingParamsFromRoute(searchParams, {
        defaultCategories: [categoryId],
        limit: PRODUCTS_PAGE_SIZE,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    [searchParams, categoryId, location.latitude, location.longitude],
  )

  const {
    data: productsData,
    isLoading: isProductsLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchProductsListingInfinite(apiParams, {
    query: {
      getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor,
    },
  })

  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page?.products ?? []) ?? [],
    [productsData],
  )

  const pages = productsData?.pages
  const hasMoreProducts = pages?.length
    ? (pages[pages.length - 1]?.metadata?.nextCursor ?? null) !== null
    : false

  const onLoadMore = useCallback(() => {
    if (hasMoreProducts) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasMoreProducts])

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: `category-${categoryId}`,
    itemListName: 'category',
  })

  const renderItem = useCallback(
    (product: ListingProductSummary, index: number) => (
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
    ),
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
    <div className="grid grid-cols-2 gap-4 py-4">
      <FlatList
        fragment
        itemKey="id"
        data={products}
        skeletonCount={6}
        renderItem={renderItem}
        renderSkeleton={renderSkeleton}
        loading={isProductsLoading || isLocationLoading}
        emptyContent={
          <p className="typo-body-medium text-text-secondary col-span-full py-8 text-center">
            محصولی پیدا نشد
          </p>
        }
        infiniteOptions={{
          onLoadMore,
          hasMore: hasMoreProducts,
          loadingMoreSkeletonCount: 4,
          loadingMore: isFetchingNextPage,
        }}
      />
    </div>
  )
}

export default CategoryProductsSection
