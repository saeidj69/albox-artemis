'use client'

import { useMemo } from 'react'

import { RiEqualizerLine } from '@remixicon/react'

import FilterSheet from '@/modules/search/components/FilterSheet'

import Button from '@/lib/Button'
import { showSheet } from '@/lib/Sheet'
import {
  listingSearchHasActiveSheetFilters,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

type SearchFilterButtonProps = {
  searchParams: ListingFiltersRouteSearchParams
}

const SearchFilterButton = (props: SearchFilterButtonProps) => {
  const { searchParams } = props

  const hasActiveFilters = useMemo(
    () => listingSearchHasActiveSheetFilters(searchParams),
    [searchParams],
  )

  return (
    <span className="relative inline-flex">
      <Button
        startIcon={<RiEqualizerLine />}
        variant="text"
        size="small"
        onClick={() => {
          void showSheet(FilterSheet, { searchParams })
        }}
        classNames={{
          root: 'relative',
          content: 'text-text-primary typo-label-small',
          startIcon: 'text-text-primary',
        }}
        aria-label={
          hasActiveFilters ? 'فیلتر، فیلترهایی روی نتایج اعمال شده' : 'فیلتر'
        }
      >
        فیلتر
      </Button>
      {hasActiveFilters ? (
        <span
          className="bg-primary-600 ring-background-main pointer-events-none absolute inset-e-0 -top-0.5 size-2 rounded-full ring-2"
          aria-hidden
        />
      ) : null}
    </span>
  )
}

export default SearchFilterButton
