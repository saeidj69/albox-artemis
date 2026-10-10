import type { NmvTrackStepView } from '@/modules/campaigns/utils/build-nmv-campaign-view'

import { MS_PER_FULL_SEGMENT, POP_LEAD_MS } from './nmv-track-timing'

export type NmvSegmentPlanItem = {
  fillDelayMs: number
  fillDurationMs: number
}

export type NmvTrackPlan = {
  segments: NmvSegmentPlanItem[]
  /** CSS delay until each step activates + pops (`null` = stays inactive) */
  stepActivateDelayMs: Array<number | null>
}

/**
 * Linear track timeline: every progress-percent costs the same time.
 * Segment duration = (segmentProgress / 100) * MS_PER_FULL_SEGMENT.
 * Step i arrives at fillStart + sum(durations[0..i-1]).
 */
export const buildLinearTrackPlan = (
  steps: NmvTrackStepView[],
  fillStartMs: number,
  minActivateMs: number,
): NmvTrackPlan => {
  const segmentCount = Math.max(0, steps.length - 1)

  const durations = Array.from({ length: segmentCount }, (_, index) => {
    const progress = Math.min(
      100,
      Math.max(0, steps[index]?.segmentProgress ?? 0),
    )
    return (progress / 100) * MS_PER_FULL_SEGMENT
  })

  const prefixMs = (end: number) =>
    durations.slice(0, end).reduce((sum, duration) => sum + duration, 0)

  const segments: NmvSegmentPlanItem[] = durations.map(
    (fillDurationMs, index) => ({
      fillDelayMs: fillStartMs + prefixMs(index),
      fillDurationMs,
    }),
  )

  const headUnits = durations.reduce(
    (sum, duration) => sum + duration / MS_PER_FULL_SEGMENT,
    0,
  )
  const reachedStepIndex =
    steps.length === 0 ? -1 : Math.min(steps.length - 1, Math.floor(headUnits))

  const stepActivateDelayMs = steps.map((_, index) => {
    if (index > reachedStepIndex) {
      return null
    }

    const arriveAtMs = fillStartMs + prefixMs(index)
    return Math.max(minActivateMs, arriveAtMs - POP_LEAD_MS)
  })

  return { segments, stepActivateDelayMs }
}
