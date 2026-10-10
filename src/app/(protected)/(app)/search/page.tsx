import { Metadata } from 'next'

import SearchMainPage from '@/modules/search/pages/main'

import type { ListingFiltersRouteSearchParams } from '@/lib/utils/listing-filters-query'

export const metadata: Metadata = {
  title: 'جست‌وجو',
}

type PageProps = {
  searchParams: Promise<ListingFiltersRouteSearchParams>
}

const SearchPage = async (props: PageProps) => {
  const searchParams = await props.searchParams

  return <SearchMainPage searchParams={searchParams} />
}

export default SearchPage
