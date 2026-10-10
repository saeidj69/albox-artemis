'use client'

import { ListingPageType } from '@/api/models'
import type {
  ListingHydratedBlankGridPage,
  ListingHydratedProductsGridPage,
} from '@/api/models'

import PreparedBlankGridPageContent from './PreparedBlankGridPageContent'
import PreparedProductsGridPageContent from './PreparedProductsGridPageContent'

type PreparedPageContentRendererProps = {
  page: ListingHydratedBlankGridPage | ListingHydratedProductsGridPage
  isHome: boolean
}

const PreparedPageContentRenderer = (
  props: PreparedPageContentRendererProps,
) => {
  const { page, isHome } = props

  switch (page.type) {
    case ListingPageType.blank_grid_page:
      return (
        <PreparedBlankGridPageContent
          page={page as ListingHydratedBlankGridPage}
          isHome={isHome}
        />
      )

    case ListingPageType.products_grid_page:
      return (
        <PreparedProductsGridPageContent
          page={page as ListingHydratedProductsGridPage}
          isHome={isHome}
        />
      )

    default:
      return null
  }
}

export default PreparedPageContentRenderer
