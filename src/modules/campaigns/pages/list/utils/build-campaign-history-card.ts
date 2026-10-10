import {
  formatGiftPercentage,
  readGiftPercentage,
} from '@/modules/campaigns/utils/build-nmv-campaign-view'
import {
  formatCampaignChargeDate,
  formatCampaignPeriod,
} from '@/modules/campaigns/utils/campaign-dates'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'
import { IncentivesCampaignState } from '@/api/models'

import type {
  CampaignHistoryCardProps,
  CampaignHistoryTone,
} from '../components/CampaignHistoryCard/CampaignHistoryCard'

const LIVE_STATES = new Set<IncentivesCampaignState>([
  IncentivesCampaignState.active,
  IncentivesCampaignState.upcoming,
])

const PENDING_CHARGE_STATES = new Set<IncentivesCampaignState>([
  IncentivesCampaignState.settling,
  IncentivesCampaignState.ended,
])

const FINAL_AMOUNT_DISCLAIMER =
  'مبلغ قطعی بعد از تحویل تمام سفارش‌های این دوره تعیین می‌شود.'

const INELIGIBLE_MESSAGE = 'جایزه‌ی این دوره شامل حال شما نشد :('

const resolveRewardPercent = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
) => {
  const resolved = campaign.participant.evaluation?.resolvedStepIds ?? []
  const steps = campaign.participant.steps ?? []
  const evaluationSteps = campaign.participant.evaluation?.steps ?? []

  const resolvedStep = evaluationSteps.find((step) =>
    resolved.includes(step.campaignStepId),
  )
  if (resolvedStep) {
    const participantStep = steps.find(
      (item) => item.campaignStepId === resolvedStep.campaignStepId,
    )
    return (
      readGiftPercentage(resolvedStep.estimatedReward?.payload) ??
      readGiftPercentage(participantStep?.rewardParams ?? undefined)
    )
  }

  const lastAchieved = [...evaluationSteps]
    .reverse()
    .find((step) => step.effectiveAchieved)
  if (lastAchieved) {
    const participantStep = steps.find(
      (item) => item.campaignStepId === lastAchieved.campaignStepId,
    )
    return (
      readGiftPercentage(lastAchieved.estimatedReward?.payload) ??
      readGiftPercentage(participantStep?.rewardParams ?? undefined)
    )
  }

  return null
}

const readRewardAmount = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
) => {
  const payload = campaign.participant.rewards?.[0]?.payload
  if (!payload) {
    return null
  }

  const amount = payload.amount
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : null
}

const formatTomanLabel = (amountRial: number | null) =>
  formatPrice(toTomanPrice(amountRial ?? 0))

const buildThresholdMessage = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
  delivered: number,
) => {
  const firstStep = [...(campaign.participant.evaluation?.steps ?? [])].sort(
    (a, b) => a.position - b.position,
  )[0]

  if (!firstStep || delivered >= firstStep.target) {
    return null
  }

  return `برای دریافت جایزه این دوره، حداقل ${formatPrice(toTomanPrice(firstStep.target))} تومان خرید کنید.`
}

const resolveHistoryStatus = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
): { label: string; tone: CampaignHistoryTone } => {
  if (LIVE_STATES.has(campaign.state)) {
    return { label: 'در انتظار اتمام دوره', tone: 'warning' }
  }

  if (PENDING_CHARGE_STATES.has(campaign.state)) {
    return { label: 'در انتظار شارژ کیف پول', tone: 'warning' }
  }

  if (campaign.state === IncentivesCampaignState.completed) {
    const hasReward = (campaign.participant.rewards?.length ?? 0) > 0
    if (hasReward) {
      return { label: 'کیف پول شارژ شد', tone: 'success' }
    }

    return { label: 'جایزه دریافت نشد', tone: 'muted' }
  }

  return { label: campaign.state, tone: 'muted' }
}

const PENDING_CHARGE_LABEL = 'شارژ کیف پول: به زودی!'

const resolveSettledAtLabel = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
) => {
  if (PENDING_CHARGE_STATES.has(campaign.state)) {
    return PENDING_CHARGE_LABEL
  }

  if (campaign.state !== IncentivesCampaignState.completed) {
    return null
  }

  const hasReward = (campaign.participant.rewards?.length ?? 0) > 0
  if (!hasReward) {
    return null
  }

  const settledAt =
    campaign.participant.settlement?.settledAt ?? campaign.completedAt
  if (!settledAt) {
    return null
  }

  return `شارژ کیف پول: ${formatCampaignChargeDate(settledAt)}`
}

export const buildCampaignHistoryCardProps = (
  campaign: ListMyIncentiveCampaigns200CampaignsItem,
): CampaignHistoryCardProps => {
  const status = resolveHistoryStatus(campaign)
  const percent = resolveRewardPercent(campaign)
  const delivered =
    campaign?.participant?.evaluation?.steps?.[0]?.certainProgress ?? 0

  const rewardAmount = readRewardAmount(campaign)

  const estimatedAmount =
    rewardAmount ?? (percent != null ? Math.round(delivered * percent) : null)

  const period = formatCampaignPeriod(campaign.startAt, campaign.endAt)
  const isActive = campaign.state === IncentivesCampaignState.active
  const periodTitle = isActive ? `دوره فعال (${period})` : period

  const isLive =
    LIVE_STATES.has(campaign.state) || PENDING_CHARGE_STATES.has(campaign.state)

  const prizeLabel =
    percent != null
      ? `مبلغ جایزه${isLive ? ' تا امروز' : ''} (${formatGiftPercentage(percent)}):`
      : 'مبلغ جایزه:'

  let footerMessage: string | null = null
  if (status.tone === 'muted') {
    footerMessage = INELIGIBLE_MESSAGE
  } else if (isLive) {
    footerMessage =
      buildThresholdMessage(campaign, delivered) ?? FINAL_AMOUNT_DISCLAIMER
  }

  return {
    periodTitle,
    statusLabel: status.label,
    tone: status.tone,
    orderAmountLabel: formatTomanLabel(delivered),
    prizeLabel,
    prizeAmountLabel: formatTomanLabel(estimatedAmount),
    footerMessage,
    settledAtLabel: resolveSettledAtLabel(campaign),
  }
}
