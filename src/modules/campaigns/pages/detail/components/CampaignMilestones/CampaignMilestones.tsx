'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  buildNmvCampaignView,
  formatGiftPercentage,
} from '@/modules/campaigns/utils/build-nmv-campaign-view'
import { mapEvaluationStepsToViewInput } from '@/modules/campaigns/utils/map-evaluation-steps'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { useGetMyIncentiveCampaign } from '@/api/functions/incentives'
import type { GetMyIncentiveCampaign200 } from '@/api/models'

import { cn } from '@/lib/utils'

import { MilestonePath, useMilestonePaths } from './components/MilestonePath'
import MilestoneStep from './components/Step'

export type CampaignMilestonesProps = {
  campaignId: number
  className?: string
}

type CampaignMilestone = {
  id: number
  position: number
  title: string
  description: string
  percentage: number | null
  target: number
  isAchieved: boolean
  isCurrent: boolean
}

const buildMilestonesView = (
  data: GetMyIncentiveCampaign200,
): { milestones: CampaignMilestone[]; certainProgress: number } => {
  const { campaign, evaluation, participant } = data
  const steps = mapEvaluationStepsToViewInput({
    evaluationSteps: evaluation.steps,
    participantSteps: participant.steps,
  })
  const view = buildNmvCampaignView({
    displayName: campaign.displayName,
    steps,
  })
  const certainProgress = evaluation.steps[0]?.certainProgress ?? 0
  const nextStepPercent = steps
    .slice()
    .sort((a, b) => a.position - b.position)
    .find((step) => step.percentage != null)?.percentage

  const zeroStageDescription = `مرحله‌ی صفر! با هر سفارش موفق در آل‌باکس، یک قدم به ${
    nextStepPercent != null ? `${formatGiftPercentage(nextStepPercent)} ` : ''
  }اعتبار هدیه نزدیک شو.`

  const milestones: CampaignMilestone[] = [
    {
      id: 0,
      position: 0,
      title: 'مرحله صفر',
      description: zeroStageDescription,
      percentage: null,
      target: 0,
      isAchieved: certainProgress > 0,
      isCurrent: certainProgress <= 0,
    },
    ...evaluation.steps
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((step) => {
        const mapped = steps.find((item) => item.id === step.id)
        return {
          id: step.id,
          position: step.position,
          title: step.title,
          description: step.title,
          percentage: mapped?.percentage ?? null,
          target: step.target,
          isAchieved: step.effectiveAchieved,
          isCurrent: view.trackSteps.some(
            (track) => track.id === step.id && track.isCurrent,
          ),
        }
      }),
  ]

  return { milestones, certainProgress }
}

const CampaignMilestonesContent = (props: {
  milestones: CampaignMilestone[]
  certainProgress: number
  className?: string
}) => {
  const { milestones, certainProgress, className } = props
  const { containerRef, registerStep, paths } = useMilestonePaths(
    milestones.length,
  )
  const stepTargets = useMemo(
    () => milestones.map((milestone) => milestone.target),
    [milestones],
  )
  const [passedStepIndex, setPassedStepIndex] = useState(-1)
  const handlePassedStepIndexChange = useCallback((index: number) => {
    setPassedStepIndex(index)
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="campaign-milestones"
      className={cn('relative flex flex-col gap-20 pb-4', className)}
    >
      <MilestonePath
        paths={paths}
        stepCount={milestones.length}
        stepTargets={stepTargets}
        certainProgress={certainProgress}
        onPassedStepIndexChange={handlePassedStepIndexChange}
      />

      {milestones.map((milestone, index) => {
        const isStart = index === 0
        // RTL: flex-row puts the step on the right — start serpentine from the right
        const stepOnRight = index % 2 === 0
        const isActive = index <= passedStepIndex

        return (
          <div
            key={milestone.id}
            className={cn(
              'relative z-10 flex items-center gap-3',
              stepOnRight ? 'flex-row' : 'flex-row-reverse',
            )}
          >
            <div ref={(node) => registerStep(index, node)} className="shrink-0">
              <MilestoneStep
                isActive={isActive}
                percentage={!isStart ? milestone.percentage : null}
              />
            </div>

            <p className="typo-body-medium text-text-secondary min-w-0 flex-1 text-right">
              {isStart ? (
                milestone.description
              ) : (
                <>
                  با بیش از{' '}
                  <span className="typo-label-medium text-text-primary">
                    {formatPrice(toTomanPrice(milestone.target))} تومان
                  </span>{' '}
                  خرید موفق، معادل{' '}
                  <span className="typo-label-medium text-text-primary">
                    {milestone.percentage != null
                      ? formatGiftPercentage(milestone.percentage)
                      : 'جایزه'}
                  </span>{' '}
                  از خریدهایتان اعتبار هدیه بگیرید.
                </>
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export const CampaignMilestonesComponent = (props: CampaignMilestonesProps) => {
  const { campaignId, className } = props

  const { data } = useGetMyIncentiveCampaign(campaignId, {
    query: { enabled: !!campaignId },
  })

  if (!data) {
    return null
  }

  const { milestones, certainProgress } = buildMilestonesView(data)

  if (milestones.length === 0) {
    return null
  }

  return (
    <CampaignMilestonesContent
      milestones={milestones}
      certainProgress={certainProgress}
      className={className}
    />
  )
}
