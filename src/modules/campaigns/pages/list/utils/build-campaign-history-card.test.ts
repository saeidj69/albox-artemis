import { describe, expect, test } from 'vitest'

import { formatCampaignChargeDate } from '@/modules/campaigns/utils/campaign-dates'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'
import { IncentivesCampaignState, IncentivesRewardType } from '@/api/models'

import { buildCampaignHistoryCardProps } from './build-campaign-history-card'

const evaluatedStep = (overrides: {
  campaignStepId?: number
  position?: number
  certainProgress?: number
  target?: number
  effectiveAchieved?: boolean
  percentage?: number
}) => ({
  id: overrides.campaignStepId ?? 1,
  campaignStepId: overrides.campaignStepId ?? 10,
  position: overrides.position ?? 1,
  title: 'Step',
  certainProgress: overrides.certainProgress ?? 0,
  possibleProgress: 0,
  target: overrides.target ?? 200_000_000,
  achieved: Boolean(overrides.effectiveAchieved),
  effectiveAchieved: Boolean(overrides.effectiveAchieved),
  progressionLocked: false,
  details: {},
  rewardResolved: false,
  estimatedReward: {
    type: IncentivesRewardType.gift_percentage_over_finalized_orders_net_total,
    payload: { percentage: overrides.percentage ?? 0.01 },
  },
})

const campaign = (
  overrides: {
    state?: IncentivesCampaignState
    steps?: ReturnType<typeof evaluatedStep>[]
    resolvedStepIds?: number[]
    rewards?: { payload: { amount?: number } }[]
    startAt?: string
    endAt?: string
    settledAt?: string
    completedAt?: string | null
  } = {},
): ListMyIncentiveCampaigns200CampaignsItem => {
  const steps = overrides.steps ?? [
    evaluatedStep({ certainProgress: 50_000_000, percentage: 0.01 }),
  ]

  return {
    id: 7,
    internalName: 'hist',
    displayName: 'کمپین تست',
    description: null,
    startAt: overrides.startAt ?? '2026-09-01T00:00:00+03:30',
    endAt: overrides.endAt ?? '2026-09-30T23:59:59+03:30',
    progression: 'sequential',
    rewardResolution: 'highest_wins',
    rewardTiming: 'campaign_end',
    state: overrides.state ?? IncentivesCampaignState.active,
    confirmedAt: null,
    confirmedBy: null,
    settlementStartedAt: null,
    settlementStartedBy: null,
    completedAt: overrides.completedAt ?? null,
    createdAt: '2026-09-01T00:00:00+03:30',
    updatedAt: '2026-09-01T00:00:00+03:30',
    participantId: 1,
    participant: {
      id: 1,
      campaignId: 7,
      customerId: 1,
      customer: null,
      createdAt: '2026-09-01T00:00:00+03:30',
      updatedAt: '2026-09-01T00:00:00+03:30',
      steps: [],
      rewards: overrides.rewards as never,
      settlement: overrides.settledAt
        ? ({ id: 1, settledAt: overrides.settledAt, result: {} } as never)
        : null,
      evaluation: {
        isFinal: false,
        steps,
        resolvedStepIds: overrides.resolvedStepIds ?? [],
        estimatedRewards: [],
      },
    },
  } as ListMyIncentiveCampaigns200CampaignsItem
}

describe('buildCampaignHistoryCardProps', () => {
  test('marks an active campaign as waiting for period end with live disclaimer', () => {
    const delivered = 200_000_000
    const props = buildCampaignHistoryCardProps(
      campaign({
        steps: [
          evaluatedStep({
            certainProgress: delivered,
            target: 200_000_000,
            effectiveAchieved: true,
            percentage: 0.01,
          }),
        ],
      }),
    )

    expect(props.statusLabel).toBe('در انتظار اتمام دوره')
    expect(props.tone).toBe('warning')
    expect(props.periodTitle).toMatch(/^دوره فعال \(/)
    expect(props.prizeLabel).toBe('مبلغ جایزه تا امروز (٪۱):')
    expect(props.footerMessage).toBe(
      'مبلغ قطعی بعد از تحویل تمام سفارش‌های این دوره تعیین می‌شود.',
    )
    expect(props.orderAmountLabel).toBe(formatPrice(toTomanPrice(delivered)))
    expect(props.settledAtLabel).toBeNull()
    expect(props.prizeAmountLabel).toBe(
      formatPrice(toTomanPrice(Math.round(delivered * 0.01))),
    )
  })

  test('shows the threshold message when delivered is below the first step target', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({
        steps: [
          evaluatedStep({
            certainProgress: 10_000_000,
            target: 200_000_000,
            percentage: 0.01,
          }),
        ],
      }),
    )

    expect(props.footerMessage).toBe(
      `برای دریافت جایزه این دوره، حداقل ${formatPrice(toTomanPrice(200_000_000))} تومان خرید کنید.`,
    )
  })

  test('uses pending-charge status for settling campaigns', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.settling,
        steps: [
          evaluatedStep({
            certainProgress: 0,
            target: 10_000_000,
            percentage: 0.01,
          }),
        ],
      }),
    )

    expect(props.statusLabel).toBe('در انتظار شارژ کیف پول')
    expect(props.tone).toBe('warning')
    expect(props.periodTitle).not.toMatch(/^دوره فعال/)
    expect(props.settledAtLabel).toBe('شارژ کیف پول: به زودی!')
    expect(props.prizeLabel).toBe('مبلغ جایزه:')
    expect(props.orderAmountLabel).toBe(formatPrice(0))
    expect(props.prizeAmountLabel).toBe(formatPrice(0))
    expect(props.footerMessage).toBe(
      `برای دریافت جایزه این دوره، حداقل ${formatPrice(toTomanPrice(10_000_000))} تومان خرید کنید.`,
    )
  })

  test('shows the upcoming charge label for ended campaigns', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({ state: IncentivesCampaignState.ended }),
    )

    expect(props.statusLabel).toBe('در انتظار شارژ کیف پول')
    expect(props.settledAtLabel).toBe('شارژ کیف پول: به زودی!')
  })

  test('marks completed campaigns with a reward as charged', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.completed,
        rewards: [{ payload: { amount: 1_000_000 } }],
        steps: [
          evaluatedStep({
            certainProgress: 100_000_000,
            effectiveAchieved: true,
            percentage: 0.01,
          }),
        ],
      }),
    )

    expect(props.statusLabel).toBe('کیف پول شارژ شد')
    expect(props.tone).toBe('success')
    expect(props.prizeLabel).toBe('مبلغ جایزه (٪۱):')
    expect(props.prizeAmountLabel).toBe(formatPrice(toTomanPrice(1_000_000)))
    expect(props.footerMessage).toBeNull()
    expect(props.settledAtLabel).toBeNull()
  })

  test('shows the wallet charge date from settlement.settledAt', () => {
    const settledAt = '2026-08-27T10:00:00+03:30'
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.completed,
        rewards: [{ payload: { amount: 1_000_000 } }],
        settledAt,
        completedAt: '2026-09-01T00:00:00+03:30',
      }),
    )

    expect(props.settledAtLabel).toBe(
      `شارژ کیف پول: ${formatCampaignChargeDate(settledAt)}`,
    )
  })

  test('falls back to completedAt when the participant has no settlement', () => {
    const completedAt = '2026-06-22T12:00:00+03:30'
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.completed,
        rewards: [{ payload: { amount: 1_000_000 } }],
        completedAt,
      }),
    )

    expect(props.settledAtLabel).toBe(
      `شارژ کیف پول: ${formatCampaignChargeDate(completedAt)}`,
    )
  })

  test('marks completed campaigns without a reward as ineligible', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.completed,
        rewards: [],
      }),
    )

    expect(props.statusLabel).toBe('جایزه دریافت نشد')
    expect(props.tone).toBe('muted')
    expect(props.footerMessage).toBe('جایزه‌ی این دوره شامل حال شما نشد :(')
    expect(props.settledAtLabel).toBeNull()
    expect(props.prizeAmountLabel).toBe(formatPrice(0))
  })

  test('prefers the resolved evaluation step percentage when present', () => {
    const props = buildCampaignHistoryCardProps(
      campaign({
        state: IncentivesCampaignState.ended,
        resolvedStepIds: [20],
        steps: [
          evaluatedStep({
            campaignStepId: 10,
            position: 1,
            certainProgress: 80_000_000,
            percentage: 0.01,
          }),
          evaluatedStep({
            campaignStepId: 20,
            position: 2,
            certainProgress: 80_000_000,
            effectiveAchieved: true,
            percentage: 0.02,
          }),
        ],
      }),
    )

    expect(props.prizeLabel).toContain('٪۲')
    expect(props.settledAtLabel).toBe('شارژ کیف پول: به زودی!')
  })
})
