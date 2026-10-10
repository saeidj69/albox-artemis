'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { RiSortDesc } from '@remixicon/react'

import { useLocation } from '@/modules/addresses/hooks'

import { useSearchProductsListing } from '@/api/functions/catalogue'
import { ListingCategory, ListingProductSort } from '@/api/models'

import Chip from '@/lib/Chip'
import FlatList from '@/lib/FlatList'
import { showSheet } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

import BrandSortSheet from './brand-sort-sheet'

type BrandCategoriesListProps = {
  brandId: number
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number | null) => void
  selectedSort: ListingProductSort
  onSelectSort: (sort: ListingProductSort) => void
}

const ALL_CHIP_KEY = -1

const BrandCategoriesList = ({
  brandId,
  selectedCategoryId,
  onSelectCategory,
  selectedSort,
  onSelectSort,
}: BrandCategoriesListProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeChipRef = useRef<HTMLButtonElement>(null)

  const { location, isLoading: isLocationLoading } = useLocation()

  const { data: categories, isLoading } = useSearchProductsListing(
    {
      brands: [brandId],
      limit: 1,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        select: (data) => data?.metadata?.relevantCategories ?? [],
        enabled: !isLocationLoading,
      },
    },
  )

  const items = useMemo<(ListingCategory | { id: number; name: string })[]>(
    () => [{ id: ALL_CHIP_KEY, name: 'همه' }, ...(categories ?? [])],
    [categories],
  )

  useEffect(() => {
    const node = activeChipRef.current
    if (!node) return

    node.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedCategoryId, items.length])

  const openSortSheet = useCallback(() => {
    showSheet(BrandSortSheet, {
      selectedSort,
      onApply: onSelectSort,
    })
  }, [selectedSort, onSelectSort])

  const renderItem = useCallback(
    (item: { id: number; name: string }) => {
      const isAllChip = item.id === ALL_CHIP_KEY
      const isActive = isAllChip
        ? selectedCategoryId === null
        : item.id === selectedCategoryId

      return (
        <Chip
          ref={isActive ? activeChipRef : undefined}
          size="large"
          variant="default"
          onClick={() => onSelectCategory(isAllChip ? null : item.id)}
          className={cn(
            'h-10 shrink-0 px-4',
            isActive && 'border-primary-600 border-2',
          )}
          classNames={{
            content: cn(
              'typo-label-small',
              isActive && 'text-primary-700 font-semibold',
            ),
          }}
          content={item.name}
        />
      )
    },
    [selectedCategoryId, onSelectCategory],
  )

  const renderSkeleton = useCallback(() => {
    return (
      <Chip.Skeleton size="large" className="bg-border-main w-20 shrink-0" />
    )
  }, [])

  const hasCategories = isLoading || items.length > 1

  return (
    <section className="-mx-4 flex items-center gap-3 ps-4">
      <button
        type="button"
        onClick={openSortSheet}
        className="text-text-primary flex h-10 shrink-0 cursor-pointer items-center gap-1.5"
        aria-label="مرتب‌سازی"
      >
        <RiSortDesc className="size-5" />
        <span className="typo-label-small">مرتب‌سازی</span>
      </button>

      {hasCategories && (
        <>
          <div className="bg-border-main h-6 w-px shrink-0" />

          <FlatList
            direction="horizontal"
            nodeRef={scrollerRef}
            className="min-w-0 flex-1 scrollbar-none gap-2 pe-4 pb-1 [&::-webkit-scrollbar]:hidden"
            loading={isLoading || isLocationLoading}
            data={items}
            itemKey="id"
            renderItem={renderItem}
            renderSkeleton={renderSkeleton}
            skeletonCount={6}
          />
        </>
      )}
    </section>
  )
}

export default BrandCategoriesList
