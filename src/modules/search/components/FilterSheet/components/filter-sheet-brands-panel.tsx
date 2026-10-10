'use client'

import { useEffect, useMemo, useState } from 'react'

import { useDebouncedValue } from 'rooks'

import { BrandFilterList } from '@/components/ListingFilterParts'

import { useLocation } from '@/modules/addresses/hooks'
import { useSearchFilterDraft } from '@/modules/search/hooks/use-search-filter-draft'

import { useListBrandsListingInfinite } from '@/api/functions/catalogue'

import SearchInput from '@/lib/SearchInput'

import { FILTER_SHEET_BRANDS_PAGE_SIZE } from '../constants'

type FilterSheetBrandsPanelProps = {
  queryEnabled: boolean
}

const FilterSheetBrandsPanel = (props: FilterSheetBrandsPanelProps) => {
  const { queryEnabled } = props
  const [brandSearch, setBrandSearch] = useState('')
  const [debouncedBrandSearch] = useDebouncedValue(brandSearch, 300)

  const { draft, toggleBrandId } = useSearchFilterDraft()
  const { location, isLoading: isLocationLoading } = useLocation()

  const {
    data: brandsPages,
    isLoading: isBrandsQueryLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListBrandsListingInfinite(
    {
      limit: FILTER_SHEET_BRANDS_PAGE_SIZE,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: queryEnabled && !isLocationLoading,
      },
    },
  )

  const isBrandsLoading = isLocationLoading || isBrandsQueryLoading

  const allFetchedBrands = useMemo(
    () => brandsPages?.pages.flatMap((page) => page?.brands ?? []) ?? [],
    [brandsPages],
  )

  const displayBrands = useMemo(() => {
    const q = debouncedBrandSearch.trim().toLowerCase()
    if (!q) return allFetchedBrands
    return allFetchedBrands.filter((b) => b.name.toLowerCase().includes(q))
  }, [allFetchedBrands, debouncedBrandSearch])

  useEffect(() => {
    if (!queryEnabled) return
    const q = debouncedBrandSearch.trim().toLowerCase()
    if (!q) return
    if (!hasNextPage || isFetchingNextPage) return
    const hasMatch = allFetchedBrands.some((b) =>
      b.name.toLowerCase().includes(q),
    )
    if (!hasMatch) {
      void fetchNextPage()
    }
  }, [
    allFetchedBrands,
    debouncedBrandSearch,
    fetchNextPage,
    hasNextPage,
    queryEnabled,
    isFetchingNextPage,
  ])

  const showBrandLoadMore = !debouncedBrandSearch.trim() && Boolean(hasNextPage)

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={brandSearch}
        onChange={(event) => setBrandSearch(event.target.value)}
        placeholder="جستجو در برندها"
        aria-label="جستجو در برندها"
      />

      <div>
        {isBrandsLoading ? (
          <p className="typo-body-small text-text-secondary py-8 text-center">
            در حال بارگذاری…
          </p>
        ) : (
          <BrandFilterList
            brands={displayBrands}
            selectedIds={draft.brandIds}
            onToggle={toggleBrandId}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => {
              void fetchNextPage()
            }}
            showLoadMore={showBrandLoadMore}
          />
        )}
      </div>
    </div>
  )
}

export default FilterSheetBrandsPanel
