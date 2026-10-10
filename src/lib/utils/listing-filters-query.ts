import type { ListingProductSort } from '@/api/models/listingProductSort'
import { ListingProductSort as ListingProductSortEnum } from '@/api/models/listingProductSort'
import type { SearchProductsListingParams } from '@/api/models/searchProductsListingParams'

/**
 * Parsed listing filters shared by search and category routes (app layer).
 */
export type ListingFiltersQuery = {
  q?: string
  brands?: number[]
  inStock?: boolean
  categories?: number[]
  minPrice?: number
  maxPrice?: number
  sort?:
    | (typeof ListingProductSort)[keyof typeof ListingProductSort]
    | 'relevance'
}

/**
 * Raw query shape from Next.js App Router `searchParams` (strings / arrays).
 */
export type ListingFiltersRouteSearchParams = Partial<{
  q: string
  brands: string | string[]
  inStock: string
  categories: string | string[]
  minPrice: string
  maxPrice: string
  sort: string
}>

function firstString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value[0] : value
}

function parseNumberList(
  value: string | string[] | undefined,
): number[] | undefined {
  if (value === undefined) return undefined
  const items = Array.isArray(value) ? value : [value]
  const nums = items.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
  return nums.length ? nums : undefined
}

function parseSingleNumber(
  value: string | string[] | undefined,
): number | undefined {
  const raw = firstString(value)
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Converts Next route `searchParams` into typed listing filters.
 */
export function parseListingFiltersFromRoute(
  searchParams: ListingFiltersRouteSearchParams,
): Partial<ListingFiltersQuery> {
  const result: Partial<ListingFiltersQuery> = {}

  const q = firstString(searchParams.q)
  if (q) result.q = q

  const brands = parseNumberList(searchParams.brands)
  if (brands) result.brands = brands

  const categories = parseNumberList(searchParams.categories)
  if (categories) result.categories = categories

  const inStockRaw = firstString(searchParams.inStock)
  if (inStockRaw === 'true') result.inStock = true
  if (inStockRaw === 'false') result.inStock = false

  const minPrice = parseSingleNumber(searchParams.minPrice)
  if (minPrice != null) result.minPrice = minPrice
  const maxPrice = parseSingleNumber(searchParams.maxPrice)
  if (maxPrice != null) result.maxPrice = maxPrice

  const sortRaw = firstString(searchParams.sort)
  if (sortRaw) {
    result.sort = sortRaw as NonNullable<ListingFiltersQuery['sort']>
  }

  return result
}

/**
 * Whether the search URL includes any filters edited in the listing filter sheet
 * (categories, brands, in-stock-only). Excludes text query and sort.
 */
export function listingSearchHasActiveSheetFilters(
  searchParams: ListingFiltersRouteSearchParams,
): boolean {
  const p = parseListingFiltersFromRoute(searchParams)
  if ((p.categories?.length ?? 0) > 0) return true
  if ((p.brands?.length ?? 0) > 0) return true
  if (p.inStock === true) return true
  if (p.minPrice != null || p.maxPrice != null) return true
  return false
}

/**
 * Serializes listing filters into a query string (no leading `?`).
 */
export function serializeListingFiltersQuery(
  filters?: Partial<ListingFiltersQuery>,
): string {
  if (!filters) return ''

  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.inStock === true) params.set('inStock', 'true')
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.sort) params.set('sort', filters.sort)

  filters.brands?.forEach((id) => {
    params.append('brands', String(id))
  })
  filters.categories?.forEach((id) => {
    params.append('categories', String(id))
  })

  return params.toString()
}

const LISTING_PRODUCT_SORT_VALUES = new Set<string>(
  Object.values(ListingProductSortEnum),
)

/**
 * Maps route search params to the generated listing products API params (GET `/listing/products`).
 * - Omits `cursor` (infinite query supplies it per page).
 * - `query` is sent only when length ≥ 2 (API rule).
 * - Route `inStock=true` maps to API `inStock`.
 */
export function buildSearchProductsListingParamsFromRoute(
  searchParams: ListingFiltersRouteSearchParams,
  options?: {
    defaultCategories?: number[]
    limit?: number
    latitude: number
    longitude: number
  },
): SearchProductsListingParams {
  const parsed = parseListingFiltersFromRoute(searchParams)
  const limit = options?.limit ?? 20

  const categories =
    parsed.categories && parsed.categories.length > 0
      ? parsed.categories
      : options?.defaultCategories

  const params: SearchProductsListingParams = {
    limit,
    latitude: options?.latitude ?? 0,
    longitude: options?.longitude ?? 0,
  }

  if (categories?.length) {
    params.categories = categories
  }

  const q = parsed.q?.trim()
  if (q && q.length >= 2) {
    params.query = q
  }

  if (parsed.brands?.length) {
    params.brands = parsed.brands
  }

  if (parsed.inStock === true) {
    params.inStock = true
  }

  const sort = parsed.sort
  if (sort && sort !== 'relevance' && LISTING_PRODUCT_SORT_VALUES.has(sort)) {
    params.sort = sort as ListingProductSort
  }

  return params
}
