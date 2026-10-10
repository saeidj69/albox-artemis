'use client'

import { useCallback } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'

import {
  createSearchFilterDraftFromParams,
  type SearchFilterDraft,
  searchFilterDraftAtom,
} from '@/modules/search/atoms/filter-draft'

import type { ListingFiltersRouteSearchParams } from '@/lib/utils/listing-filters-query'

export type UseSearchFilterDraftResult = {
  draft: SearchFilterDraft
  /** Replace the entire draft from the current route search params. */
  syncFromSearchParams: (searchParams: ListingFiltersRouteSearchParams) => void
  toggleCategoryId: (id: number) => void
  toggleBrandId: (id: number) => void
  setAvailableOnly: (availableOnly: boolean) => void
}

/**
 * Read and update the search filter sheet draft (categories, brands, price, stock).
 */
export function useSearchFilterDraft(): UseSearchFilterDraftResult {
  const draft = useAtomValue(searchFilterDraftAtom)
  const setDraft = useSetAtom(searchFilterDraftAtom)

  const syncFromSearchParams = useCallback(
    (searchParams: ListingFiltersRouteSearchParams) => {
      setDraft(createSearchFilterDraftFromParams(searchParams))
    },
    [setDraft],
  )

  const toggleCategoryId = useCallback(
    (id: number) => {
      setDraft((prev) => {
        const next = new Set(prev.categoryIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return { ...prev, categoryIds: next }
      })
    },
    [setDraft],
  )

  const toggleBrandId = useCallback(
    (id: number) => {
      setDraft((prev) => {
        const next = new Set(prev.brandIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return { ...prev, brandIds: next }
      })
    },
    [setDraft],
  )

  const setAvailableOnly = useCallback(
    (availableOnly: boolean) => {
      setDraft((prev) => ({ ...prev, availableOnly }))
    },
    [setDraft],
  )

  return {
    draft,
    syncFromSearchParams,
    toggleCategoryId,
    toggleBrandId,
    setAvailableOnly,
  }
}
