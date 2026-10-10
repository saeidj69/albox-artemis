'use client'

import { useCallback, useMemo } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Animate from '@/components/Animate'
import CategoryCard from '@/components/CategoryCard'

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

import { useGetCategoryTree } from '@/api/functions/catalogue'
import { ListingCategory } from '@/api/models'

import FlatList from '@/lib/FlatList'

/** The grid is 3-up, so a builder anchor counts rows of three categories. */
const CATEGORIES_PER_ROW = 3

type CategoriesGridItem = InterleavedEntry<ListingCategory, PreparedHydratedRow>

const CategoriesList = () => {
  const { data: categories, isLoading } = useGetCategoryTree({
    query: {
      select(data) {
        return data?.categories || []
      },
    },
  })

  // Optional marketing rows woven between the category rows. A missing page is
  // an empty state, so the grid never waits on it.
  const { rows } = usePreparedPageRows(PREPARED_PAGE_PATHS.CATEGORIES)

  const { topRows, entries } = useMemo(
    () =>
      interleaveByAnchor({
        rows,
        items: categories ?? [],
        itemsPerRow: CATEGORIES_PER_ROW,
        mayLoadMore: isLoading,
      }),
    [rows, categories, isLoading],
  )

  const renderItem = useCallback((item: CategoriesGridItem) => {
    if (item.kind === 'widget') {
      return (
        <div className="col-span-3">
          <PreparedWidgetRow row={item.row} index={item.widgetIndex} />
        </div>
      )
    }

    return (
      <Animate animation="slideUp" delay={item.index * 20}>
        <Link
          href={ROUTES.CATEGORIES.detail(item.item.id)}
          passHref
          prefetch={false}
        >
          <CategoryCard category={item.item} />
        </Link>
      </Animate>
    )
  }, [])

  const renderSkeleton = useCallback((index: number) => {
    return (
      <Animate key={index} animation="slideUp" delay={index * 20}>
        <CategoryCard.Skeleton />
      </Animate>
    )
  }, [])

  const itemKey = useCallback(
    (item: CategoriesGridItem) =>
      item.kind === 'widget' ? item.key : `c-${item.item.id}`,
    [],
  )

  return (
    <>
      {topRows.length > 0 && (
        <div className="mb-4 flex flex-col gap-4">
          {topRows.map((row, index) => (
            <PreparedWidgetRow
              key={`top-${row.position}-${index}`}
              row={row}
              index={index}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-10">
        <FlatList
          fragment
          loading={isLoading}
          skeletonCount={9}
          data={entries}
          itemKey={itemKey}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
        />
      </div>
    </>
  )
}

export default CategoriesList
