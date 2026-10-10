'use client'

import { useCallback, useMemo } from 'react'

import { useProductListTracking } from '@/hooks/useProductListTracking'

import Animate from '@/components/Animate'
import ProductCard from '@/components/ProductCard'
import VisibilityTracker from '@/components/VisibilityTracker'

import { useLocation } from '@/modules/addresses/hooks'

import { useGetPreparedPageProductsInfinite } from '@/api/functions/clients-page'
import type {
  GetPreparedPageProducts200,
  ListingHydratedProductsGridPage,
  ListingProductSummary,
} from '@/api/models'

import FlatList from '@/lib/FlatList'

import {
  interleaveByAnchor,
  type InterleavedEntry,
} from '../../../utils/interleave-by-anchor'
import {
  useHomeDataPopulate,
  type PreparedPageRow,
} from '../hooks/use-home-data-populate'
import { buildRowsFromStructure } from '../utils/build-rows-from-structure'
import { normalizeHydratedRows } from '../utils/normalize-rows'
import PreparedRowRenderer from './PreparedRowRenderer'

type PreparedProductsGridPageContentProps = {
  page: ListingHydratedProductsGridPage
  isHome: boolean
}

const PRODUCTS_PER_PAGE = 20
const PRODUCTS_PER_ROW = 2

/** One cell of the interleaved grid: a product (1 col) or a full-width widget. */
type GridItem = InterleavedEntry<ListingProductSummary, PreparedPageRow>

const PreparedProductsGridPageContent = (
  props: PreparedProductsGridPageContentProps,
) => {
  const { page, isHome } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const rows = useMemo(
    () =>
      normalizeHydratedRows(
        buildRowsFromStructure(page.structure, page.widgets),
      ),
    [page.structure, page.widgets],
  )

  const displayRows = useHomeDataPopulate(rows, { enabled: isHome })

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetPreparedPageProductsInfinite(
    page.id,
    {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: Number.isFinite(page.id) && page.id > 0 && !isLocationLoading,
        getNextPageParam: (lastPage: GetPreparedPageProducts200) =>
          lastPage.metadata.nextCursor ?? undefined,
      },
    },
  )

  const products = useMemo(
    () =>
      productsData?.pages.flatMap((pageItem) => pageItem.products ?? []) ?? [],
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

  // Widgets anchored at row 0 sit above the grid (always visible, like a header);
  // deeper anchors interleave between product rows inside the grid. A widget's
  // `position` is the number of product rows that precede it.
  const { topRows, entries: gridItems } = useMemo(
    () =>
      interleaveByAnchor({
        rows: displayRows,
        items: products,
        itemsPerRow: PRODUCTS_PER_ROW,
        mayLoadMore: hasMoreProducts || isProductsLoading,
      }),
    [displayRows, products, hasMoreProducts, isProductsLoading],
  )

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: `prepared-page-${page.id}`,
    itemListName: page.name,
  })

  const renderItem = useCallback(
    (item: GridItem) => {
      if (item.kind === 'widget') {
        return (
          <div className="col-span-2">
            <PreparedRowRenderer row={item.row} index={item.widgetIndex} />
          </div>
        )
      }

      return (
        <Animate
          animation="slideUp"
          delay={(item.index % PRODUCTS_PER_PAGE) * 50}
        >
          <VisibilityTracker
            threshold={1}
            triggerOnce
            onChange={(inView) => {
              if (inView) onProductVisible(item.item, item.index)
            }}
          >
            <ProductCard
              product={item.item}
              onProductOpen={() => onProductOpen(item.item, item.index)}
            />
          </VisibilityTracker>
        </Animate>
      )
    },
    [onProductVisible, onProductOpen],
  )

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate animation="slideUp" delay={(index % PRODUCTS_PER_PAGE) * 50}>
        <ProductCard.Skeleton />
      </Animate>
    )
  }, [])

  const itemKey = useCallback(
    (item: GridItem) =>
      item.kind === 'widget' ? item.key : `p-${item.item.id}`,
    [],
  )

  return (
    <>
      {topRows.length > 0 && (
        <div className="flex flex-col gap-4">
          {topRows.map((row, index) => (
            <PreparedRowRenderer key={row.trackingId} row={row} index={index} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FlatList
          fragment
          itemKey={itemKey}
          data={gridItems}
          skeletonCount={6}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          loading={isProductsLoading || isLocationLoading}
          infiniteOptions={{
            hasMore: hasMoreProducts,
            onLoadMore,
            loadingMore: isFetchingNextPage,
            loadingMoreSkeletonCount: 4,
          }}
        />
      </div>
    </>
  )
}

export default PreparedProductsGridPageContent
