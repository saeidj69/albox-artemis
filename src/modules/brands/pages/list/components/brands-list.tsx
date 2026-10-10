'use client'

import { useCallback, useMemo } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Animate from '@/components/Animate'
import BrandCard from '@/components/BrandCard'

import { useLocation } from '@/modules/addresses/hooks'
import PreparedWidgetRow from '@/modules/discovery/components/PreparedWidgetRow'
import { PREPARED_PAGE_PATHS } from '@/modules/discovery/constants/prepared-page-paths'
import {
  usePreparedPageRows,
  type PreparedHydratedRow,
} from '@/modules/discovery/hooks/use-prepared-page-rows'
import {
  interleaveByAnchor,
  type InterleavedEntry,
} from '@/modules/discovery/utils/interleave-by-anchor'

import { useListBrandsListingInfinite } from '@/api/functions/catalogue'
import { ListingBrand } from '@/api/models'

import FlatList from '@/lib/FlatList'

const BRANDS_PER_PAGE = 48
/** The grid is 3-up, so a builder anchor counts rows of three brands. */
const BRANDS_PER_ROW = 3

type BrandsGridItem = InterleavedEntry<ListingBrand, PreparedHydratedRow>

const BrandsList = () => {
  const { location, isLoading: isLocationLoading } = useLocation()

  const defaultList = useListBrandsListingInfinite(
    {
      limit: BRANDS_PER_PAGE,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: !isLocationLoading,
        select(data) {
          const brands = data.pages.flatMap((page) => page?.brands || [])
          const hasMore =
            data.pages[data.pages.length - 1]?.metadata?.nextCursor !== null

          return { brands, hasMore }
        },
        getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor,
        staleTime: 1000 * 60 * 5,
      },
    },
  )

  const brands = useMemo(
    () => defaultList.data?.brands || [],
    [defaultList.data],
  )
  const hasMore = defaultList.data?.hasMore || false
  const isLoading = isLocationLoading || defaultList.isLoading
  const isFetchingNextPage = defaultList.isFetchingNextPage
  const fetchNextPage = defaultList.fetchNextPage

  // Optional marketing rows woven between the brand rows. A missing page is an
  // empty state, so the grid never waits on it.
  const { rows } = usePreparedPageRows(PREPARED_PAGE_PATHS.BRANDS)

  const { topRows, entries } = useMemo(
    () =>
      interleaveByAnchor({
        rows,
        items: brands,
        itemsPerRow: BRANDS_PER_ROW,
        // Deep anchors wait for the pages they sit in, then flush at the end.
        mayLoadMore: hasMore || isLoading,
      }),
    [rows, brands, hasMore, isLoading],
  )

  const onLoadMore = useCallback(() => {
    if (hasMore) fetchNextPage()
  }, [fetchNextPage, hasMore])

  const renderItem = useCallback((item: BrandsGridItem) => {
    if (item.kind === 'widget') {
      return (
        <div className="col-span-3">
          <PreparedWidgetRow row={item.row} index={item.widgetIndex} />
        </div>
      )
    }

    return (
      <Animate animation="slideUp" delay={(item.index % BRANDS_PER_PAGE) * 20}>
        <Link
          href={ROUTES.BRANDS.detail(item.item.id)}
          passHref
          prefetch={false}
        >
          <BrandCard brand={item.item} />
        </Link>
      </Animate>
    )
  }, [])

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate
        key={index}
        animation="slideUp"
        delay={(index % BRANDS_PER_PAGE) * 20}
      >
        <BrandCard.Skeleton />
      </Animate>
    )
  }, [])

  const itemKey = useCallback(
    (item: BrandsGridItem) =>
      item.kind === 'widget' ? item.key : `b-${item.item.id}`,
    [],
  )

  return (
    <div className="space-y-6">
      {topRows.length > 0 && (
        <div className="flex flex-col gap-4">
          {topRows.map((row, index) => (
            <PreparedWidgetRow
              key={`top-${row.position}-${index}`}
              row={row}
              index={index}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <FlatList
          fragment
          loading={isLoading}
          skeletonCount={12}
          data={entries}
          itemKey={itemKey}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          emptyContent={
            <div className="text-text-secondary typo-body-medium col-span-3 py-12 text-center">
              برندی پیدا نشد
            </div>
          }
          infiniteOptions={{
            hasMore,
            onLoadMore,
            loadingMoreSkeletonCount: 9,
            loadingMore: isFetchingNextPage,
          }}
        />
      </div>
    </div>
  )
}

export default BrandsList
