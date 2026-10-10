'use client'

import { useCallback, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import { useProductListTracking } from '@/hooks/useProductListTracking'

import Animate from '@/components/Animate'
import Header, { HeaderLogo } from '@/components/Header'
import HeaderAnimatedTitle from '@/components/Header/components/HeaderAnimatedTitle'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import VisibilityTracker from '@/components/VisibilityTracker'

import { useLocation } from '@/modules/addresses/hooks'
import SearchPageToolbar from '@/modules/search/pages/main/components/search-page-toolbar'

import { useSearchProductsListingInfinite } from '@/api/functions/catalogue'
import type { ListingProductSummary } from '@/api/models'

import FlatList from '@/lib/FlatList'
import {
  buildSearchProductsListingParamsFromRoute,
  parseListingFiltersFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

const PRODUCTS_PAGE_SIZE = 20

type SearchMainPageProps = {
  searchParams: ListingFiltersRouteSearchParams
}

const SearchMainPage = (props: SearchMainPageProps) => {
  const { searchParams } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const filtersFromRoute = useMemo(
    () => parseListingFiltersFromRoute(searchParams),
    [searchParams],
  )

  const urlQuery = filtersFromRoute.q ?? ''
  const headerQuery = urlQuery.trim()
  const { ref: toolbarRef, inView: isToolbarVisible } = useInView({
    initialInView: true,
  })

  const apiParams = useMemo(
    () =>
      buildSearchProductsListingParamsFromRoute(searchParams, {
        limit: PRODUCTS_PAGE_SIZE,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    [searchParams, location.latitude, location.longitude],
  )

  const {
    data: productsData,
    isLoading: isProductsLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchProductsListingInfinite(apiParams, {
    query: {
      enabled: !isLocationLoading,
      getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor,
    },
  })

  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page?.products ?? []) ?? [],
    [productsData],
  )

  const pages = productsData?.pages
  const firstMetadata = pages?.[0]?.metadata
  const availableBrands = firstMetadata?.relevantBrands ?? []
  const availableCategories = firstMetadata?.relevantCategories ?? []
  const minRetailPrice = firstMetadata?.minRetailPrice ?? null
  const maxRetailPrice = firstMetadata?.maxRetailPrice ?? null
  const hasMoreProducts = pages?.length
    ? (pages[pages.length - 1]?.metadata?.nextCursor ?? null) !== null
    : false

  const onLoadMore = useCallback(() => {
    if (hasMoreProducts) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasMoreProducts])

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: 'search',
    itemListName: 'search',
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
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center={
            <HeaderAnimatedTitle
              primaryTitle="جست‌وجو"
              secondaryTitle={headerQuery}
              isPrimaryVisible={!headerQuery || isToolbarVisible}
            />
          }
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="flex flex-col gap-3 pb-4">
        <div ref={toolbarRef}>
          <SearchPageToolbar
            urlQuery={urlQuery}
            searchParams={searchParams}
            availableBrands={availableBrands}
            availableCategories={availableCategories}
            minRetailPrice={minRetailPrice}
            maxRetailPrice={maxRetailPrice}
            isFiltersLoading={isProductsLoading || isLocationLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FlatList
            fragment
            loading={isProductsLoading || isLocationLoading}
            data={products}
            itemKey="id"
            renderItem={renderItem}
            renderSkeleton={renderSkeleton}
            skeletonCount={6}
            infiniteOptions={{
              onLoadMore,
              hasMore: hasMoreProducts,
              loadingMore: isFetchingNextPage,
              loadingMoreSkeletonCount: 4,
              threshold: 0.5,
            }}
          />
        </div>
      </main>
    </>
  )
}

export default SearchMainPage
