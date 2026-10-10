'use client'

import { useMemo } from 'react'

import { useLocation } from '@/modules/addresses/hooks'

import { useGetPreparedPage } from '@/api/functions/clients-page'
import { useListMyIncentiveCampaigns } from '@/api/functions/incentives'

import PreparedHomeHeader from './components/PreparedHomeHeader'
import PreparedPageContentRenderer from './components/PreparedPageContentRenderer'
import PreparedSubpageHeader from './components/PreparedSubpageHeader'
import BannerWidget from './components/widgets/BannerWidget'
import BillboardWidget from './components/widgets/BillboardWidget'
import BrandsRowWidget from './components/widgets/BrandsRowWidget'
import CategoriesRowWidget from './components/widgets/CategoriesRowWidget'
import NmvWidget from './components/widgets/NmvWidget'
import ProductsCartWidget from './components/widgets/ProductsCartWidget'
import { resolveIsHomePreparedPage } from './utils/is-home-prepared-route'

type PreparedPageProps = {
  path: string
}

const PreparedPage = (props: PreparedPageProps) => {
  const { path } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const { data, isLoading } = useGetPreparedPage(
    {
      path,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    { query: { enabled: !isLocationLoading } },
  )

  const page = data?.page

  const isHome = useMemo(
    () => resolveIsHomePreparedPage(path, page),
    [path, page],
  )

  useListMyIncentiveCampaigns(undefined, {
    query: { enabled: isHome },
  })

  return (
    <>
      {isHome ? (
        <PreparedHomeHeader />
      ) : (
        <PreparedSubpageHeader isLoading={isLoading} title={page?.name ?? ''} />
      )}

      <div className="-mt-4 flex flex-col gap-4 py-4">
        {isLoading || isLocationLoading || !page ? (
          <>
            {isHome ? (
              <>
                {/* The home hero slot is the full-bleed billboard. */}
                <BillboardWidget.Skeleton />
                <CategoriesRowWidget.Skeleton />
                <ProductsCartWidget.Skeleton />
                <BannerWidget.Skeleton />
                <BrandsRowWidget.Skeleton />
              </>
            ) : (
              <>
                <BannerWidget.Skeleton />
                <ProductsCartWidget.Skeleton />
              </>
            )}
          </>
        ) : (
          <PreparedPageContentRenderer page={page} isHome={isHome} />
        )}
      </div>
    </>
  )
}

export default PreparedPage
