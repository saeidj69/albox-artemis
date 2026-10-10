'use client'

import { FC, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderAnimatedTitle from '@/components/Header/components/HeaderAnimatedTitle'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import BrandCategoriesList from '@/modules/brands/pages/details/components/brand-categories-list'
import BrandInfo from '@/modules/brands/pages/details/components/brand-info'
import BrandProductsGrid from '@/modules/brands/pages/details/components/brand-products-grid'

import { useGetBrandListing } from '@/api/functions/catalogue'
import { ListingProductSort } from '@/api/models'

type BrandDetailsPageProps = {
  brandId: number
}

const BrandDetailsPage: FC<BrandDetailsPageProps> = (props) => {
  const { brandId } = props
  const { ref: brandInfoRef, inView: isBrandInfoVisible } = useInView({
    initialInView: true,
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  )

  const [selectedSort, setSelectedSort] =
    useState<ListingProductSort>('popularity:desc')

  const { data: brandTitle } = useGetBrandListing(brandId, {
    query: {
      select(data) {
        return data?.brand?.name
      },
    },
  })

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center={
            <HeaderAnimatedTitle
              primaryTitle="جزئیات برند"
              secondaryTitle={brandTitle}
              isPrimaryVisible={isBrandInfoVisible}
            />
          }
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="space-y-6 py-4">
        <div ref={brandInfoRef}>
          <BrandInfo brandId={brandId} />
        </div>
        <BrandCategoriesList
          brandId={brandId}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
        />
        <BrandProductsGrid
          brandId={brandId}
          categoryId={selectedCategoryId}
          sort={selectedSort}
        />
      </main>
    </>
  )
}

export default BrandDetailsPage
