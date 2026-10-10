'use client'

import { useLocation } from '@/modules/addresses/hooks'
import PreparedPageContentRenderer from '@/modules/discovery/pages/prepared/components/PreparedPageContentRenderer'
import BannerWidget from '@/modules/discovery/pages/prepared/components/widgets/BannerWidget'
import ProductsCartWidget from '@/modules/discovery/pages/prepared/components/widgets/ProductsCartWidget'

import { useGetPreparedPage } from '@/api/functions/clients-page'

import { cn } from '@/lib/utils'

/** Structure rarely changes within a session; keep the empty state instant. */
const PREPARED_CONTENT_STALE_TIME = 1000 * 60 * 5
/** Outlives leaving and returning to the screen, so a known-missing page costs one request. */
const PREPARED_CONTENT_GC_TIME = 1000 * 60 * 30

type ExplorePreparedContentProps = {
  /** CMS page path (see `PREPARED_PAGE_PATHS`). May not exist in the admin. */
  path: string
  className?: string
}

/**
 * Optional page-builder content for the search screen's empty state.
 *
 * The page is marketing-owned and frequently absent, so a missing one is an
 * empty state, not an error: the request opts out of the global error toast and
 * the component renders nothing on failure. It never gates the search input —
 * it mounts beside it and resolves on its own.
 */
const ExplorePreparedContent = (props: ExplorePreparedContentProps) => {
  const { path, className } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const { data, isLoading, isError } = useGetPreparedPage(
    {
      path,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: !isLocationLoading,
        staleTime: PREPARED_CONTENT_STALE_TIME,
        gcTime: PREPARED_CONTENT_GC_TIME,
      },
      request: { skipErrorToast: true },
    },
  )

  // React Query reports `isLoading === false` while the query is disabled, so
  // the location gate has to be checked explicitly.
  if (isLocationLoading || isLoading) {
    return (
      <div
        data-slot="explore-prepared-content-skeleton"
        className={cn('mt-4 flex flex-col gap-4', className)}
      >
        <BannerWidget.Skeleton />
        <ProductsCartWidget.Skeleton />
      </div>
    )
  }

  const page = data?.page

  if (isError || !page) {
    return null
  }

  return (
    <div
      data-slot="explore-prepared-content"
      className={cn('mt-4 flex flex-col gap-4', className)}
    >
      <PreparedPageContentRenderer page={page} isHome={false} />
    </div>
  )
}

export default ExplorePreparedContent
