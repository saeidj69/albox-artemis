import { Metadata, NextPage } from 'next'

import CategoryDetailsPage from '@/modules/categories/pages/details'

import type { ListingFiltersRouteSearchParams } from '@/lib/utils/listing-filters-query'

type PageProps = {
  params: Promise<{ categoryId: string }>
  searchParams: Promise<ListingFiltersRouteSearchParams>
}

export const metadata: Metadata = {
  title: 'جزئیات دسته بندی',
}

const Page: NextPage<PageProps> = async (props) => {
  const { categoryId } = await props.params
  const searchParams = await props.searchParams

  return (
    <CategoryDetailsPage
      categoryId={Number(categoryId)}
      searchParams={searchParams}
    />
  )
}

export default Page
