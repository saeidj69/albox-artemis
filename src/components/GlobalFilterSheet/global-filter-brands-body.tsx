'use client'

import { useEffect, useMemo, useState } from 'react'

import { useDebouncedValue } from 'rooks'

import { BrandFilterList } from '@/components/ListingFilterParts'

import type { ListingBrand } from '@/api/models'

import SearchInput from '@/lib/SearchInput'

import { GLOBAL_FILTER_BRAND_SEARCH_DEBOUNCE_MS } from './constants'

export type GlobalFilterBrandsBodyProps = {
  brands: ListingBrand[]
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  selectedIds: Set<number>
  onToggle: (id: number) => void
}

const GlobalFilterBrandsBody = (props: GlobalFilterBrandsBodyProps) => {
  const {
    brands,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    selectedIds,
    onToggle,
  } = props

  const [brandSearch, setBrandSearch] = useState('')
  const [debouncedBrandSearch] = useDebouncedValue(
    brandSearch,
    GLOBAL_FILTER_BRAND_SEARCH_DEBOUNCE_MS,
  )

  const displayBrands = useMemo(() => {
    const q = debouncedBrandSearch.trim().toLowerCase()
    if (!q) return brands
    return brands.filter((b) => b.name.toLowerCase().includes(q))
  }, [brands, debouncedBrandSearch])

  useEffect(() => {
    if (!onLoadMore) return
    const q = debouncedBrandSearch.trim().toLowerCase()
    if (!q) return
    if (!hasNextPage || isFetchingNextPage) return
    const hasMatch = brands.some((b) => b.name.toLowerCase().includes(q))
    if (!hasMatch) {
      onLoadMore()
    }
  }, [
    brands,
    debouncedBrandSearch,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  ])

  const showBrandLoadMore = !debouncedBrandSearch.trim() && Boolean(hasNextPage)

  if (isLoading) {
    return (
      <p className="typo-body-small text-text-secondary py-8 text-center">
        در حال بارگذاری…
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={brandSearch}
        onChange={(event) => setBrandSearch(event.target.value)}
        placeholder="جستجو در برندها"
        aria-label="جستجو در برندها"
      />

      <BrandFilterList
        brands={displayBrands}
        selectedIds={selectedIds}
        onToggle={onToggle}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage ?? false}
        onLoadMore={() => {
          onLoadMore?.()
        }}
        showLoadMore={showBrandLoadMore}
      />
    </div>
  )
}

export default GlobalFilterBrandsBody
