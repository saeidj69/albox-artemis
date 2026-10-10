'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'

import {
  GlobalFilterSheetTrigger,
  showGlobalFilterSheet,
} from '@/components/GlobalFilterSheet'
import {
  GlobalSortSheetTrigger,
  showGlobalSortSheet,
} from '@/components/GlobalSortSheet'

import { useLocation } from '@/modules/addresses/hooks'

import {
  useGetCategoryTree,
  useSearchProductsListing,
} from '@/api/functions/catalogue'
import type { ListingCategory } from '@/api/models'

import Chip from '@/lib/Chip'
import Divider from '@/lib/Divider'
import FlatList from '@/lib/FlatList'
import { cn } from '@/lib/utils'
import {
  parseListingFiltersFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

import { findCategoryNodeById } from './category-tree-helpers'

const CATEGORY_SORT_OPTIONS = [
  { value: 'popularity:desc', label: 'محبوب‌ترین' },
  { value: 'price:asc', label: 'ارزان‌ترین' },
  { value: 'price:desc', label: 'گران‌ترین' },
  { value: 'discount:desc', label: 'بیشترین درصد تخفیف' },
] as const

type CategorySortValue = (typeof CATEGORY_SORT_OPTIONS)[number]['value']
const CATEGORY_DEFAULT_SORT: CategorySortValue = 'popularity:desc'

type CategoriesFiltersRowProps = {
  categoryId: number
  searchParams: ListingFiltersRouteSearchParams
}

const ALL_CHIP_KEY = -1

const CategoriesFiltersRow = (props: CategoriesFiltersRowProps) => {
  const { categoryId, searchParams } = props

  const router = useRouter()
  const { location, isLoading: isLocationLoading } = useLocation()

  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeChipRef = useRef<HTMLButtonElement>(null)

  const { data: categories, isLoading } = useGetCategoryTree({
    query: {
      select(data) {
        return data?.categories ?? []
      },
    },
  })

  const currentNode = useMemo(
    () => findCategoryNodeById(categories ?? [], categoryId),
    [categories, categoryId],
  )

  const subcategories = useMemo(
    () => currentNode?.children ?? [],
    [currentNode],
  )

  const parsed = useMemo(
    () => parseListingFiltersFromRoute(searchParams),
    [searchParams],
  )

  const { data: filterMetadata } = useSearchProductsListing(
    {
      categories: [categoryId],
      limit: 1,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        select: (data) => data?.metadata,
        enabled: !isLocationLoading,
      },
    },
  )

  const selectedSubId = parsed.categories?.[0] ?? null

  const items = useMemo<({ id: number; name: string } | ListingCategory)[]>(
    () => [{ id: ALL_CHIP_KEY, name: 'همه' }, ...subcategories],
    [subcategories],
  )

  useEffect(() => {
    const node = activeChipRef.current
    if (!node) return
    node.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedSubId, items.length])

  const openSortSheet = useCallback(() => {
    const selectedSort = (parsed.sort ??
      CATEGORY_DEFAULT_SORT) as CategorySortValue

    showGlobalSortSheet({
      title: 'مرتب‌سازی',
      description: 'مرتب‌سازی محصولات',
      options: CATEGORY_SORT_OPTIONS,
      selectedValue: selectedSort,
      onSelect: (value) => {
        router.replace(
          ROUTES.CATEGORIES.detail(categoryId, {
            ...parsed,
            sort: value,
          }),
        )
      },
    })
  }, [categoryId, parsed, router])

  const openFilterSheet = useCallback(() => {
    // const minPriceBound = filterMetadata?.minRetailPrice ?? 0
    // const maxPriceBound =
    //   filterMetadata?.maxRetailPrice != null &&
    //   filterMetadata.maxRetailPrice >= minPriceBound
    //     ? filterMetadata.maxRetailPrice
    //     : minPriceBound

    const options = [
      {
        id: 'available',
        kind: 'available',
        label: 'موجودی',
        availableLabel: 'فقط کالاهای موجود',
      },
      {
        id: 'brands',
        kind: 'brands',
        label: 'برند',
        detailTitle: 'برند',
        brands: filterMetadata?.relevantBrands ?? [],
        isLoading: isLocationLoading,
      },
      // {
      //   id: 'priceRange',
      //   kind: 'priceRange',
      //   label: 'محدوده قیمت',
      //   detailTitle: 'محدوده قیمت',
      //   min: minPriceBound,
      //   max: maxPriceBound,
      //   step: 1_000,
      // },
    ] as const

    showGlobalFilterSheet({
      title: 'فیلتر',
      options,
      initialDraft: {
        availableOnly: parsed.inStock === true,
        brandIds: parsed.brands ?? [],
        // priceRange: {
        //   min: parsed.minPrice ?? minPriceBound,
        //   max: parsed.maxPrice ?? maxPriceBound,
        // },
      },
      onSubmit: (values) => {
        router.replace(
          ROUTES.CATEGORIES.detail(categoryId, {
            ...parsed,
            brands: values.brandIds.length ? values.brandIds : undefined,
            inStock: values.availableOnly ? true : undefined,
            // minPrice: values.priceRange?.min,
            // maxPrice: values.priceRange?.max,
          }),
        )
      },
      onDiscard: () => {
        router.replace(
          ROUTES.CATEGORIES.detail(categoryId, {
            ...parsed,
            brands: undefined,
            inStock: undefined,
            minPrice: undefined,
            maxPrice: undefined,
          }),
        )
      },
    })
  }, [categoryId, filterMetadata, isLocationLoading, parsed, router])

  const activeFilterCount = useMemo(() => {
    let count = 0
    count += parsed.brands?.length ?? 0
    if (parsed.inStock) count += 1
    if (parsed.minPrice != null || parsed.maxPrice != null) count += 1
    return count
  }, [parsed])

  const activeSortLabel = useMemo(() => {
    const currentSort = (parsed.sort ??
      CATEGORY_DEFAULT_SORT) as CategorySortValue
    return (
      CATEGORY_SORT_OPTIONS.find((option) => option.value === currentSort)
        ?.label ?? 'مرتب‌سازی'
    )
  }, [parsed.sort])

  const handleSelectSub = useCallback(
    (subId: number | null) => {
      const next = { ...parsed }
      if (subId == null) {
        delete next.categories
      } else {
        next.categories = [subId]
      }
      router.replace(ROUTES.CATEGORIES.detail(categoryId, next))
    },
    [categoryId, parsed, router],
  )

  const renderItem = useCallback(
    (item: { id: number; name: string }) => {
      const isAllChip = item.id === ALL_CHIP_KEY
      const isActive = isAllChip
        ? selectedSubId === null
        : item.id === selectedSubId

      return (
        <Chip
          ref={isActive ? activeChipRef : undefined}
          size="large"
          variant="default"
          onClick={() => handleSelectSub(isAllChip ? null : item.id)}
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
    [selectedSubId, handleSelectSub],
  )

  const renderSkeleton = useCallback(() => {
    return (
      <Chip.Skeleton size="large" className="bg-border-main w-20 shrink-0" />
    )
  }, [])

  const hasSubcategories = isLoading || items.length > 1

  return (
    <section className="flex items-center py-3 ps-4">
      <GlobalSortSheetTrigger onOpen={openSortSheet} label={activeSortLabel} />

      <GlobalFilterSheetTrigger
        onOpen={openFilterSheet}
        hasActiveFilters={activeFilterCount > 0}
        activeFilterCount={activeFilterCount}
      />

      {hasSubcategories && (
        <>
          <Divider orientation="vertical" className="mx-2" size="large" />

          <FlatList
            itemKey="id"
            data={items}
            skeletonCount={6}
            nodeRef={scrollerRef}
            direction="horizontal"
            renderItem={renderItem}
            renderSkeleton={renderSkeleton}
            loading={isLoading || isLocationLoading}
            className="min-w-0 flex-1 scrollbar-none gap-2 pe-4 pb-1 [&::-webkit-scrollbar]:hidden"
          />
        </>
      )}
    </section>
  )
}

export default CategoriesFiltersRow
