import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'
import { IncentivesCampaignState } from '@/api/models'

import { pickActiveCampaign, useActiveCampaign } from './useActiveCampaign'

type HookState = {
  data: { campaigns: ListMyIncentiveCampaigns200CampaignsItem[] } | undefined
  isPending: boolean
}

const hookState: HookState = { data: undefined, isPending: false }

vi.mock('@/api/functions/incentives', () => ({
  useListMyIncentiveCampaigns: () => hookState,
}))

const NOW = new Date('2026-09-27T12:00:00+03:30').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

const iso = (offsetDays: number) =>
  new Date(NOW + offsetDays * DAY_MS).toISOString()

const campaign = (
  overrides: Partial<ListMyIncentiveCampaigns200CampaignsItem>,
): ListMyIncentiveCampaigns200CampaignsItem =>
  ({
    id: 1,
    displayName: 'campaign',
    description: null,
    startAt: iso(-10),
    endAt: iso(10),
    state: IncentivesCampaignState.active,
    confirmedAt: null,
    settlementStartedAt: null,
    completedAt: null,
    participantId: 1,
    ...overrides,
  }) as ListMyIncentiveCampaigns200CampaignsItem

const running = (id = 1, endAt = iso(10)) =>
  campaign({ id, startAt: iso(-10), endAt })

const awaitingSettlement = (id = 2) =>
  campaign({
    id,
    startAt: iso(-20),
    endAt: iso(-2),
    state: IncentivesCampaignState.settling,
  })

const completedDaysAgo = (days: number, id = 3) =>
  campaign({
    id,
    startAt: iso(-30),
    endAt: iso(-days - 1),
    completedAt: iso(-days),
    state: IncentivesCampaignState.completed,
  })

describe('pickActiveCampaign', () => {
  test('returns the running campaign', () => {
    expect(pickActiveCampaign([running(7)], NOW)?.id).toBe(7)
  })

  test('returns an ended campaign that is not completed yet', () => {
    expect(pickActiveCampaign([awaitingSettlement(8)], NOW)?.id).toBe(8)
  })

  test('returns a campaign completed within the last 3 days', () => {
    expect(pickActiveCampaign([completedDaysAgo(2, 9)], NOW)?.id).toBe(9)
  })

  test('returns null for a campaign completed more than 3 days ago', () => {
    expect(pickActiveCampaign([completedDaysAgo(4)], NOW)).toBeNull()
  })

  test('returns null for a campaign that has not started', () => {
    const upcoming = campaign({
      startAt: iso(2),
      endAt: iso(20),
      state: IncentivesCampaignState.upcoming,
    })

    expect(pickActiveCampaign([upcoming], NOW)).toBeNull()
  })

  test('returns null for an empty list', () => {
    expect(pickActiveCampaign([], NOW)).toBeNull()
  })

  test('skips draft campaigns', () => {
    const draft = campaign({ state: IncentivesCampaignState.draft })

    expect(pickActiveCampaign([draft], NOW)).toBeNull()
  })

  test('prefers running over awaiting settlement over recently completed', () => {
    expect(
      pickActiveCampaign(
        [completedDaysAgo(1, 3), awaitingSettlement(2), running(1)],
        NOW,
      )?.id,
    ).toBe(1)

    expect(
      pickActiveCampaign([completedDaysAgo(1, 3), awaitingSettlement(2)], NOW)
        ?.id,
    ).toBe(2)
  })

  test('breaks ties within a rule by the latest endAt', () => {
    expect(
      pickActiveCampaign([running(1, iso(5)), running(2, iso(15))], NOW)?.id,
    ).toBe(2)
  })
})

describe('useActiveCampaign', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    hookState.data = undefined
    hookState.isPending = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns the selected campaign from the list query', () => {
    hookState.data = { campaigns: [completedDaysAgo(10), running(5)] }

    const { result } = renderHook(() => useActiveCampaign())

    expect(result.current.campaign?.id).toBe(5)
  })

  test('returns null while the query is pending', () => {
    hookState.isPending = true

    const { result } = renderHook(() => useActiveCampaign())

    expect(result.current.campaign).toBeNull()
    expect(result.current.isPending).toBe(true)
  })
})
