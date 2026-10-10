'use client'

import { useMemo } from 'react'

import { useLocation } from '@/modules/addresses/hooks'

import { useGetPreparedPage } from '@/api/functions/clients-page'

import type { PreparedHydratedRow } from '../pages/prepared/types'
import { buildRowsFromStructure } from '../pages/prepared/utils/build-rows-from-structure'
import { normalizeHydratedRows } from '../pages/prepared/utils/normalize-rows'

/** Re-exported so consumers outside this module can type their grid entries. */
export type { PreparedHydratedRow }

/** Structure rarely changes within a session; keep repeat visits instant. */
const PREPARED_ROWS_STALE_TIME = 1000 * 60 * 5
/** Outlives leaving and returning to the screen, so a known-missing page costs one request. */
const PREPARED_ROWS_GC_TIME = 1000 * 60 * 30

type UsePreparedPageRowsResult = {
  /** Position-sorted builder rows; empty when no page exists at the path. */
  rows: PreparedHydratedRow[]
  isLoading: boolean
}

/**
 * Builder rows for a CMS page addressed by path, for screens that weave those
 * rows into their own content rather than rendering the page wholesale.
 *
 * These pages are marketing-owned and frequently absent, so a missing one is an
 * empty state, not an error: the request opts out of the global error toast and
 * resolves to no rows. It never gates the host screen — the screen's own
 * content renders regardless of whether this resolves.
 */
export const usePreparedPageRows = (
  path: string,
): UsePreparedPageRowsResult => {
  const { location, isLoading: isLocationLoading } = useLocation()

  const { data, isLoading } = useGetPreparedPage(
    {
      path,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    {
      query: {
        enabled: !isLocationLoading,
        staleTime: PREPARED_ROWS_STALE_TIME,
        gcTime: PREPARED_ROWS_GC_TIME,
      },
      request: { skipErrorToast: true },
    },
  )

  const page = data?.page

  const rows = useMemo(
    () =>
      normalizeHydratedRows(
        buildRowsFromStructure(page?.structure, page?.widgets),
      ),
    [page],
  )

  // React Query reports `isLoading === false` while the query is disabled, so
  // the location gate has to be checked explicitly.
  return { rows, isLoading: isLocationLoading || isLoading }
}
