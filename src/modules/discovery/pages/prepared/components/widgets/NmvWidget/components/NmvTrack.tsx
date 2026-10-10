'use client'

import { useMemo } from 'react'

import type { NmvTrackStepView } from '@/modules/campaigns/utils/build-nmv-campaign-view'

import NmvEdgeDots from './NmvEdgeDots'
import NmvTrackSegment from './NmvTrackSegment'
import { buildLinearTrackPlan } from './build-linear-track-plan'
import { resolveNmvTrackTiming } from './nmv-track-timing'

type NmvTrackProps = {
  steps: NmvTrackStepView[]
  leadingDotCount: number
  trailingDotCount: number
}

const NmvTrackAnimated = (props: NmvTrackProps) => {
  const { steps, leadingDotCount, trailingDotCount } = props

  const timing = resolveNmvTrackTiming({
    stepCount: steps.length,
    leadingDotCount,
  })

  const plan = useMemo(
    () =>
      buildLinearTrackPlan(steps, timing.fillStartMs, timing.stepsStartDelay),
    [steps, timing.fillStartMs, timing.stepsStartDelay],
  )

  return (
    <div data-slot="nmv-track" className="flex h-5 w-full items-center gap-1">
      <NmvEdgeDots
        count={leadingDotCount}
        isActive={true}
        startDelay={timing.leadingStartDelay}
      />

      {steps.map((step, index) => (
        <NmvTrackSegment
          key={step.id}
          step={step}
          index={index}
          isLast={index === steps.length - 1}
          stepsStartDelay={timing.stepsStartDelay}
          segment={plan.segments[index]}
          activateDelayMs={plan.stepActivateDelayMs[index] ?? null}
        />
      ))}

      <NmvEdgeDots
        count={trailingDotCount}
        isActive={false}
        startDelay={timing.trailingStartDelay}
      />
    </div>
  )
}

const NmvTrack = (props: NmvTrackProps) => {
  const { steps, leadingDotCount, trailingDotCount } = props

  if (steps.length === 0) {
    return null
  }

  const animationKey = steps
    .map((step) => `${step.id}:${step.segmentProgress}:${step.isActive}`)
    .join('|')

  return (
    <NmvTrackAnimated
      key={animationKey}
      steps={steps}
      leadingDotCount={leadingDotCount}
      trailingDotCount={trailingDotCount}
    />
  )
}

export default NmvTrack
