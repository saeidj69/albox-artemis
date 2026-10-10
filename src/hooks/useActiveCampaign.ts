import { useMemo } from 'react'

import { useListMyIncentiveCampaigns } from '@/api/functions/incentives'
import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'
import { IncentivesCampaignState } from '@/api/models'

type Campaign = ListMyIncentiveCampaigns200CampaignsItem

const DAY_MS = 24 * 60 * 60 * 1000
const RECENTLY_COMPLETED_WINDOW_MS = 3 * DAY_MS

const toTime = (value: string | null) =>
  value ? new Date(value).getTime() : Number.NaN

const isRunning = (campaign: Campaign, now: number) =>
  toTime(campaign.startAt) <= now && now <= toTime(campaign.endAt)

const isAwaitingSettlement = (campaign: Campaign, now: number) =>
  now > toTime(campaign.endAt) && campaign.completedAt === null

const isRecentlyCompleted = (campaign: Campaign, now: number) => {
  const completedAt = toTime(campaign.completedAt)
  return (
    now > toTime(campaign.endAt) &&
    now - completedAt <= RECENTLY_COMPLETED_WINDOW_MS
  )
}

const RULES = [isRunning, isAwaitingSettlement, isRecentlyCompleted]

const latestEnding = (a: Campaign, b: Campaign) =>
  toTime(b.endAt) - toTime(a.endAt)

/**
 * Picks the single campaign to surface: running now, else ended but not
 * settled, else completed within the last 3 days. Earlier rules win across
 * the whole list; ties resolve to the latest `endAt`.
 */
export const pickActiveCampaign = (
  campaigns: Campaign[],
  now = Date.now(),
): Campaign | null => {
  const candidates = campaigns.filter(
    (campaign) => campaign.state !== IncentivesCampaignState.draft,
  )

  for (const rule of RULES) {
    const [match] = candidates
      .filter((campaign) => rule(campaign, now))
      .sort(latestEnding)

    if (match) return match
  }

  return null
}

export const useActiveCampaign = (enabled = true) => {
  const query = useListMyIncentiveCampaigns(undefined, {
    query: { enabled },
  })

  const campaign = useMemo(
    () => pickActiveCampaign(query.data?.campaigns ?? []),
    [query.data],
  )

  return { campaign, isPending: query.isPending }
}
