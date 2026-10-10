'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import {
  getListBrandsListingUrl,
  type ListBrandsListingInfiniteQueryError,
} from '@/api/functions/catalogue'
import type {
  ListBrandsListing200,
  ListBrandsListingParams,
} from '@/api/models'
import { mutator } from '@/api/mutator'

// The jupiter backend supports `query` on /listing/brands (min 2 chars) but it
// is not published in the OpenAPI spec, so we bypass the generated function
// type-cast-style to reuse the existing URL builder + mutator.
type BrandsSearchParams = ListBrandsListingParams & { query?: string }

const fetchSearchBrands = (
  params: BrandsSearchParams,
  signal?: AbortSignal,
): Promise<ListBrandsListing200> => {
  const url = getListBrandsListingUrl(params as ListBrandsListingParams)

  return mutator<ListBrandsListing200>(url, { method: 'GET', signal })
}

export const useSearchBrandsInfinite = (
  query: string,
  limit: number,
  location: Pick<ListBrandsListingParams, 'latitude' | 'longitude'>,
  enabled: boolean,
) => {
  return useInfiniteQuery<
    ListBrandsListing200,
    ListBrandsListingInfiniteQueryError,
    { brands: ListBrandsListing200['brands']; hasMore: boolean },
    readonly ['search-brands', string, number, number, number],
    string | null
  >({
    queryKey: [
      'search-brands',
      query,
      limit,
      location.latitude,
      location.longitude,
    ] as const,
    queryFn: ({ pageParam, signal }) =>
      fetchSearchBrands(
        {
          query,
          limit,
          latitude: location.latitude,
          longitude: location.longitude,
          cursor: pageParam ?? undefined,
        },
        signal,
      ),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.metadata?.nextCursor ?? null,
    select: (data) => {
      const brands = data.pages.flatMap((page) => page?.brands || [])
      const hasMore =
        data.pages[data.pages.length - 1]?.metadata?.nextCursor !== null

      return { brands, hasMore }
    },
    enabled,
    staleTime: 1000 * 60,
  })
}
