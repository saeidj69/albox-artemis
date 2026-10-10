'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { EVENTS, track, WETransformer } from '@/helpers/analytics'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderAnimatedTitle from '@/components/Header/components/HeaderAnimatedTitle'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useGetCategoryTree } from '@/api/functions/catalogue'

import type { ListingFiltersRouteSearchParams } from '@/lib/utils/listing-filters-query'

import CategoriesFiltersRow from './components/categories-filters-row'
import CategoriesTabsRow from './components/categories-tabs-row'
import CategoryProductsSection from './components/category-products-section'
import { getCategoryViewNames } from './components/category-tree-helpers'

type CategoryDetailsPageProps = {
  categoryId: number
  searchParams: ListingFiltersRouteSearchParams
}

const CategoryDetailsPage = (props: CategoryDetailsPageProps) => {
  const { categoryId, searchParams } = props

  const { ref: tabsRowRef, inView: isTabsRowVisible } = useInView({
    initialInView: true,
  })

  const { data: categoryView } = useGetCategoryTree({
    query: {
      select(data) {
        const viewNames = getCategoryViewNames(
          data?.categories ?? [],
          categoryId,
        )

        return {
          title: viewNames?.category ?? '-',
          viewNames,
        }
      },
    },
  })

  const viewNames = categoryView?.viewNames

  useEffect(() => {
    if (!viewNames) return

    track(EVENTS.VIEW_CATEGORY, {
      webengage: WETransformer.toViewCategory(viewNames),
    })
  }, [viewNames?.category, viewNames?.subcategory, viewNames])

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center={
            <HeaderAnimatedTitle
              primaryTitle="جزئیات دسته بندی"
              secondaryTitle={categoryView?.title}
              isPrimaryVisible={isTabsRowVisible}
            />
          }
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main>
        <div ref={tabsRowRef} className="-mx-4">
          <CategoriesTabsRow categoryId={categoryId} />
        </div>

        <div className="-mx-4">
          <CategoriesFiltersRow
            categoryId={categoryId}
            searchParams={searchParams}
          />
        </div>

        <CategoryProductsSection
          categoryId={categoryId}
          searchParams={searchParams}
        />
      </main>
    </>
  )
}

export default CategoryDetailsPage
