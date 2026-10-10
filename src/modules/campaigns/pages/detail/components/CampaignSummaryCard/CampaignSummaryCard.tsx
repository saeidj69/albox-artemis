'use client'

import Animate from '@/components/Animate'

import CampaignCountdown from '@/modules/campaigns/components/CampaignCountdown'
import {
  formatCampaignPeriod,
  formatRemainingDaysBadge,
  remainingCampaignDays,
  remainingCampaignFullDays,
} from '@/modules/campaigns/utils/campaign-dates'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { useGetMyIncentiveCampaign } from '@/api/functions/incentives'
import type { GetMyIncentiveCampaign200 } from '@/api/models'
import { IncentivesCampaignState } from '@/api/models'

import Chip from '@/lib/Chip'
import { cn } from '@/lib/utils'

export type CampaignSummaryCardProps = {
  campaignId: number
  className?: string
}

type SummaryView = {
  periodLabel: string
  remainingBadge: string | null
  countdownEndAt: string | null
  deliveredAmount: number
  pendingAmount: number
  remainingAmount: number | null
  remainingLabel: string
}

const buildSummaryView = (data: GetMyIncentiveCampaign200): SummaryView => {
  const { campaign, evaluation } = data
  const firstStep = evaluation.steps[0]
  const nextStep = evaluation.steps.find(
    (step) => !step.effectiveAchieved && !step.progressionLocked,
  )

  const deliveredAmount = firstStep?.certainProgress ?? 0
  const pendingAmount = Math.max(
    0,
    (firstStep?.possibleProgress ?? 0) - deliveredAmount,
  )
  const remainingAmount =
    nextStep == null
      ? null
      : Math.max(0, nextStep.target - nextStep.certainProgress)

  const isRunning =
    campaign.state === IncentivesCampaignState.active &&
    remainingCampaignDays(campaign.endAt) > 0
  const hasFullDayLeft = remainingCampaignFullDays(campaign.endAt) > 0

  return {
    periodLabel: formatCampaignPeriod(campaign.startAt, campaign.endAt),
    remainingBadge:
      isRunning && hasFullDayLeft
        ? formatRemainingDaysBadge(campaign.endAt)
        : null,
    countdownEndAt: isRunning && !hasFullDayLeft ? campaign.endAt : null,
    deliveredAmount,
    pendingAmount,
    remainingAmount,
    remainingLabel: evaluation.steps.some((step) => step.effectiveAchieved)
      ? 'مانده تا جایزه بعدی:'
      : 'مانده تا اولین جایزه:',
  }
}

const AmountRow = (props: {
  label: string
  amount: number | null
  emphasize?: boolean
}) => {
  const { label, amount, emphasize } = props
  const display =
    amount == null ? '-' : formatPrice(toTomanPrice(Math.max(0, amount)))

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="typo-body-small text-text-secondary shrink-0">
        {label}
      </div>

      <div className={cn(emphasize ? 'typo-label-medium' : 'typo-body-medium')}>
        <span className="text-text-primary"> {display} </span>

        <span className="typo-label-x-small text-text-secondary shrink-0">
          تومان
        </span>
      </div>
    </div>
  )
}

export const CampaignSummaryCardComponent = (
  props: CampaignSummaryCardProps,
) => {
  const { campaignId, className } = props

  const { data } = useGetMyIncentiveCampaign(campaignId, {
    query: { enabled: !!campaignId },
  })

  if (!data) {
    return null
  }

  const view = buildSummaryView(data)

  return (
    <section
      data-slot="campaign-summary-card"
      className={cn(
        'border-border-darker rounded-brand border bg-white p-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Animate animation="slideLeft">
          <span className="typo-label-medium text-text-primary shrink-0">
            {view.periodLabel}
          </span>
        </Animate>

        <Animate animation="slideRight" delay={100}>
          {view.remainingBadge && (
            <Chip
              size="medium"
              content={view.remainingBadge}
              classNames={{
                root: 'bg-warning-main border-transparent',
                content: 'text-white',
              }}
            />
          )}
          {view.countdownEndAt && (
            <CampaignCountdown endAt={view.countdownEndAt} />
          )}
        </Animate>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <Animate animation="slideUp" delay={200}>
          <AmountRow
            label="خرید موفق (تحویل شده):"
            amount={view.deliveredAmount}
          />
        </Animate>

        <Animate animation="slideUp" delay={300}>
          <AmountRow label="در انتظار تحویل:" amount={view.pendingAmount} />
        </Animate>

        <Animate animation="slideUp" delay={400}>
          <AmountRow
            label={view.remainingLabel}
            amount={view.remainingAmount}
            emphasize
          />
        </Animate>
      </div>
    </section>
  )
}
