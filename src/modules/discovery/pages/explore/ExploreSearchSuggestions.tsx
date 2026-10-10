'use client'

import { Fragment, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {
  RiDashboardHorizontalLine,
  RiSearchLine,
  RiVerifiedBadgeLine,
} from '@remixicon/react'
import {
  createSerializer,
  parseAsNativeArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from 'nuqs'

import Animate from '@/components/Animate'
import HorizontalProductList from '@/components/HorizontalProductList'

import { useLocation } from '@/modules/addresses/hooks'

import { useSearchProductsListing } from '@/api/functions/catalogue'
import type { SearchProductsListing200 } from '@/api/models'

import Divider from '@/lib/Divider'
import type { ListingFiltersQuery } from '@/lib/utils/listing-filters-query'

import ExploreRecentSearches from './ExploreRecentSearches'
import ExploreSearchInsightRow from './ExploreSearchInsightRow'

type ExploreSearchSuggestionsProps = {
  searchEnabled: boolean
  trimmed: string
  onSelectRecentQuery: (query: string) => void
  pushRecent: (q: string) => void
}

const serializeSearchListingUrl = createSerializer({
  q: parseAsString,
  min: parseAsInteger,
  max: parseAsInteger,
  brands: parseAsNativeArrayOf(parseAsInteger),
  inStock: parseAsBoolean,
  categories: parseAsNativeArrayOf(parseAsInteger),
  sort: parseAsString,
})

const ExploreSearchSuggestions = (props: ExploreSearchSuggestionsProps) => {
  const router = useRouter()
  const [insightsRef] = useAutoAnimate()
  const { searchEnabled, trimmed, onSelectRecentQuery, pushRecent } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const { data, isPending } = useSearchProductsListing(
    {
      query: trimmed,
      limit: 10,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: searchEnabled && !isLocationLoading,
        select: (result: SearchProductsListing200) => ({
          brands: result?.metadata?.relevantBrands.slice(0, 2) ?? [],
          categories: result?.metadata?.relevantCategories.slice(0, 2) ?? [],
          products: result?.products,
        }),
      },
    },
  )

  const brands = useMemo(() => data?.brands ?? [], [data])
  const categories = useMemo(() => data?.categories ?? [], [data])
  const products = useMemo(() => data?.products ?? [], [data])
  const showBrands = isPending || brands.length > 0
  const showCategories = isPending || categories.length > 0
  const hasAnyInsight = showBrands || showCategories

  const navigateListing = (filters: Partial<ListingFiltersQuery>) => {
    const qForRecent = (filters.q ?? trimmed).trim()
    if (qForRecent.length >= 2) pushRecent(qForRecent)
    router.push(serializeSearchListingUrl(ROUTES.SEARCH, filters))
  }

  if (!searchEnabled) {
    return <ExploreRecentSearches onSelectRecentQuery={onSelectRecentQuery} />
  }

  return (
    <div className="mt-2 flex w-full flex-col">
      <div className="w-app flex w-full flex-col gap-2">
        <div ref={insightsRef} className="flex flex-col gap-2">
          <Animate animation="fadeIn">
            <ExploreSearchInsightRow
              icon={RiSearchLine}
              onClick={() => navigateListing({ q: trimmed })}
            >
              جستجوی «{trimmed}» درهمه‌ی محصولات
            </ExploreSearchInsightRow>
          </Animate>

          <Divider />

          {showCategories ? (
            isPending && categories.length === 0 ? (
              <>
                <ExploreSearchInsightRow.Skeleton />
                <ExploreSearchInsightRow.Skeleton />
              </>
            ) : (
              categories.map((category, index) => (
                <Fragment key={category.id}>
                  <Animate animation="fadeIn">
                    <ExploreSearchInsightRow
                      icon={RiDashboardHorizontalLine}
                      onClick={() =>
                        navigateListing({
                          q: trimmed,
                          categories: [category.id],
                        })
                      }
                    >
                      «{trimmed}» در دسته‌بندی {category.name}
                    </ExploreSearchInsightRow>
                  </Animate>

                  {index !== categories.length - 1 && <Divider />}
                </Fragment>
              ))
            )
          ) : null}

          {showBrands ? (
            isPending && brands.length === 0 ? (
              <>
                <ExploreSearchInsightRow.Skeleton />
                <ExploreSearchInsightRow.Skeleton />
              </>
            ) : (
              brands.map((brand, index) => (
                <Fragment key={brand.id}>
                  <Animate animation="fadeIn">
                    <ExploreSearchInsightRow
                      icon={RiVerifiedBadgeLine}
                      onClick={() =>
                        navigateListing({
                          q: trimmed,
                          brands: [brand.id],
                        })
                      }
                    >
                      «{trimmed}» در برند {brand.name}
                    </ExploreSearchInsightRow>
                  </Animate>

                  {index !== brands.length - 1 && <Divider />}
                </Fragment>
              ))
            )
          ) : null}

          {hasAnyInsight ? <Divider /> : null}
        </div>
      </div>

      <HorizontalProductList
        className="my-4"
        title="محصولات"
        products={products}
        isLoading={isPending}
      />
    </div>
  )
}

export default ExploreSearchSuggestions
