'use client'

import { useMemo } from 'react'

import { useProfile } from '@/api/functions/profile'

import type { PreparedHydratedRow, PreparedHydratedWidget } from '../types'
import {
  NMV_ROW_TRACKING_ID,
  NMV_TRACKING_ID,
  SURENA_ROW_TRACKING_ID,
  SURENA_TRACKING_ID,
} from '../utils/tracking-ids'
import { useHomeNmvCampaign } from './use-home-nmv-campaign'

export type PreparedHomeWidget =
  | PreparedHydratedWidget
  | { type: 'SURENA'; surenaCode: string }
  | { type: 'NMV' }

export type PreparedPageColumn = {
  trackingId: string
  widget: PreparedHomeWidget
  style: Record<string, string>
}

export type PreparedPageRow = Omit<PreparedHydratedRow, 'columns'> & {
  columns: PreparedPageColumn[]
}

const nmvRow = (): PreparedPageRow => ({
  trackingId: NMV_ROW_TRACKING_ID,
  position: 0,
  style: {},
  columns: [
    {
      trackingId: NMV_TRACKING_ID,
      widget: { type: 'NMV' },
      style: {},
    },
  ],
})

/**
 * Home rows are server-driven (page-builder structure + hydrated widgets).
 * Client-only additions the backend cannot know about: the profile Surena
 * banner, then the live NMV incentive card directly under it.
 */
function mergePreparedPageRows(
  rows: PreparedHydratedRow[],
  surenaCode?: string | null,
  showNmv?: boolean,
): PreparedPageRow[] {
  const list: PreparedPageRow[] = rows
    .map((row) => ({ ...row }))
    .sort((a, b) => a.position - b.position)

  const pinned: PreparedPageRow[] = []

  const trimmed = surenaCode?.trim()
  if (trimmed) {
    pinned.push({
      trackingId: SURENA_ROW_TRACKING_ID,
      position: 0,
      style: {},
      columns: [
        {
          trackingId: SURENA_TRACKING_ID,
          widget: { type: 'SURENA', surenaCode: trimmed },
          style: {},
        },
      ],
    })
  }

  if (showNmv) {
    pinned.push(nmvRow())
  }

  return [...pinned, ...list]
}

type UseHomeDataPopulateOptions = {
  /** When false, returns API rows only (no Surena or NMV injection). */
  enabled?: boolean
}

export const useHomeDataPopulate = (
  rows: PreparedHydratedRow[],
  options?: UseHomeDataPopulateOptions,
): PreparedPageRow[] => {
  const enabled = options?.enabled !== false

  const { data } = useProfile()
  const { show: showNmv } = useHomeNmvCampaign(enabled)

  const surenaCode = data?.profile?.surenaCode?.trim()

  return useMemo(() => {
    if (!enabled) {
      return rows.map((row) => ({ ...row })) as PreparedPageRow[]
    }

    return mergePreparedPageRows(rows, surenaCode, showNmv)
  }, [enabled, rows, surenaCode, showNmv])
}
