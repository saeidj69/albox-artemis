import { atom } from 'jotai'

import {
  parseListingFiltersFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

export type SearchFilterDraft = {
  categoryIds: Set<number>
  brandIds: Set<number>
  availableOnly: boolean
}

export function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false
  for (const id of a) {
    if (!b.has(id)) return false
  }
  return true
}

export function createSearchFilterDraftFromParams(
  searchParams: ListingFiltersRouteSearchParams,
): SearchFilterDraft {
  const parsed = parseListingFiltersFromRoute(searchParams)
  return {
    categoryIds: new Set(parsed.categories ?? []),
    brandIds: new Set(parsed.brands ?? []),
    availableOnly: parsed.inStock === true,
  }
}

export const searchFilterDraftAtom = atom<SearchFilterDraft>(
  createSearchFilterDraftFromParams({}),
)
