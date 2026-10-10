'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { useDebouncedValue } from 'rooks'

import {
  GlobalFilterSheetTrigger,
  showGlobalFilterSheet,
} from '@/components/GlobalFilterSheet'
import {
  GlobalSortSheetTrigger,
  showGlobalSortSheet,
} from '@/components/GlobalSortSheet'

import {
  SEARCH_SORT_OPTIONS,
  type SearchSortOptionValue,
} from '@/modules/search/constants/sort-options'

import type { ListingBrand, ListingCategory } from '@/api/models'

import SearchInput from '@/lib/SearchInput'
import {
  parseListingFiltersFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

export const SEARCH_QUERY_DEBOUNCE_MS = 300

export type SearchPageToolbarProps = {
  searchParams: ListingFiltersRouteSearchParams
  urlQuery: string
  availableBrands: ListingBrand[]
  availableCategories: ListingCategory[]
  minRetailPrice: number | null
  maxRetailPrice: number | null
  isFiltersLoading: boolean
}

const SearchPageToolbar = (props: SearchPageToolbarProps) => {
  const {
    searchParams,
    urlQuery,
    availableBrands,
    availableCategories,
    // minRetailPrice,
    // maxRetailPrice,
    isFiltersLoading,
  } = props
  const router = useRouter()
  const [query, setQuery] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [debouncedQuery, immediatelyUpdateDebouncedQuery] = useDebouncedValue(
    query,
    SEARCH_QUERY_DEBOUNCE_MS,
  )
  const lastReplacedHrefRef = useRef<string | null>(null)

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    if (query.trim() !== urlQuery.trim()) {
      setQuery(urlQuery)
    }
  }

  const commitQueryToUrl = useCallback(
    (nextQuery: string) => {
      const parsed = parseListingFiltersFromRoute(searchParams)
      const next = { ...parsed, q: nextQuery.trim() || undefined }
      const href = ROUTES.search(next)
      const currentHref = ROUTES.search(parsed)
      if (href === currentHref) {
        lastReplacedHrefRef.current = null
        return
      }
      if (lastReplacedHrefRef.current === href) return
      lastReplacedHrefRef.current = href
      router.replace(href)
    },
    [router, searchParams],
  )

  useEffect(() => {
    commitQueryToUrl(debouncedQuery)
  }, [commitQueryToUrl, debouncedQuery])

  const parsedFilters = useMemo(
    () => parseListingFiltersFromRoute(searchParams),
    [searchParams],
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    count += parsedFilters.brands?.length ?? 0
    count += parsedFilters.categories?.length ?? 0
    if (parsedFilters.inStock) count += 1
    if (parsedFilters.minPrice != null || parsedFilters.maxPrice != null)
      count += 1
    return count
  }, [parsedFilters])

  const hasActiveFilters = activeFilterCount > 0
  // const minPriceBound = minRetailPrice ?? 0
  // const maxPriceBound =
  //   maxRetailPrice != null && maxRetailPrice >= minPriceBound
  //     ? maxRetailPrice
  //     : minPriceBound

  const openFilterSheet = useCallback(() => {
    const options = [
      {
        id: 'available',
        kind: 'available',
        label: 'موجودی',
        availableLabel: 'فقط کالاهای موجود',
      },
      {
        id: 'categories',
        kind: 'categories',
        label: 'دسته‌بندی‌ها',
        detailTitle: 'دسته‌بندی‌ها',
        nodes: availableCategories,
        isLoading: isFiltersLoading,
      },
      {
        id: 'brands',
        kind: 'brands',
        label: 'برند',
        detailTitle: 'برند',
        brands: availableBrands,
        isLoading: isFiltersLoading,
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
        availableOnly: parsedFilters.inStock === true,
        brandIds: parsedFilters.brands ?? [],
        categoryIds: parsedFilters.categories ?? [],
        // priceRange: {
        //   min: parsedFilters.minPrice ?? minPriceBound,
        //   max: parsedFilters.maxPrice ?? maxPriceBound,
        // },
      },
      onSubmit: (values) => {
        const current = parseListingFiltersFromRoute(searchParams)
        router.replace(
          ROUTES.search({
            ...current,
            categories: values.categoryIds.length
              ? values.categoryIds
              : undefined,
            brands: values.brandIds.length ? values.brandIds : undefined,
            inStock: values.availableOnly ? true : undefined,
            // minPrice: values.priceRange?.min,
            // maxPrice: values.priceRange?.max,
          }),
        )
      },
      onDiscard: () => {
        const current = parseListingFiltersFromRoute(searchParams)
        router.replace(
          ROUTES.search({
            ...current,
            categories: undefined,
            brands: undefined,
            inStock: undefined,
            minPrice: undefined,
            maxPrice: undefined,
          }),
        )
      },
    })
  }, [
    availableBrands,
    availableCategories,
    isFiltersLoading,
    parsedFilters,
    router,
    searchParams,
  ])

  const openSortSheet = useCallback(() => {
    const current = parseListingFiltersFromRoute(searchParams)
    const selectedSort = (current.sort ?? 'relevance') as SearchSortOptionValue

    showGlobalSortSheet({
      title: 'مرتب‌سازی',
      description: 'انتخاب ترتیب نمایش نتایج جست‌وجو',
      options: SEARCH_SORT_OPTIONS,
      selectedValue: selectedSort,
      onSelect: (value) => {
        const next = { ...current }
        if (value === 'relevance') {
          delete next.sort
        } else {
          next.sort = value
        }
        router.replace(ROUTES.search(next))
      },
    })
  }, [router, searchParams])

  const activeSortLabel = useMemo(() => {
    const sort = parsedFilters.sort ?? 'relevance'
    return (
      SEARCH_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
      SEARCH_SORT_OPTIONS[0].label
    )
  }, [parsedFilters.sort])

  return (
    <div className="-mx-4 flex flex-col gap-3 p-4 pb-2">
      <SearchInput
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          immediatelyUpdateDebouncedQuery(query)
          commitQueryToUrl(query)
        }}
        aria-label="جست‌وجوی محصول"
      />

      <div className="flex items-center">
        <GlobalSortSheetTrigger
          onOpen={openSortSheet}
          label={activeSortLabel}
        />

        <GlobalFilterSheetTrigger
          onOpen={openFilterSheet}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  )
}

export default SearchPageToolbar
