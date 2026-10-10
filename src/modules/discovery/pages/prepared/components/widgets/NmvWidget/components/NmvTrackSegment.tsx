'use client'

import Animate from '@/components/Animate'

import type { NmvTrackStepView } from '@/modules/campaigns/utils/build-nmv-campaign-view'

import { cn } from '@/lib/utils'

import NmvProgress from './NmvProgress'
import NmvStep from './NmvStep'
import type { NmvSegmentPlanItem } from './build-linear-track-plan'
import { ITEM_STAGGER_MS } from './nmv-track-timing'

type NmvTrackSegmentProps = {
  step: NmvTrackStepView
  index: number
  isLast: boolean
  stepsStartDelay: number
  segment: NmvSegmentPlanItem | undefined
  activateDelayMs: number | null
}

const NmvTrackSegment = (props: NmvTrackSegmentProps) => {
  const { step, index, isLast, stepsStartDelay, segment, activateDelayMs } =
    props

  const activates = activateDelayMs != null

  return (
    <Animate
      animation="slideRight"
      delay={stepsStartDelay + index * ITEM_STAGGER_MS}
      className={cn('flex h-5 min-w-0 items-center gap-1', !isLast && 'flex-1')}
    >
      <div
        data-active={activates ? true : undefined}
        className="flex size-5 shrink-0 items-center justify-center"
      >
        <NmvStep activates={activates} activateDelayMs={activateDelayMs ?? 0} />
      </div>

      {isLast || !segment ? null : (
        <div className="flex h-5 min-w-12 flex-1 items-center">
          <div className="h-1.5 w-full">
            <NmvProgress
              variant="line"
              progress={step.segmentProgress}
              enableAnimation={step.enableAnimation}
              fillDelayMs={segment.fillDelayMs}
              fillDurationMs={segment.fillDurationMs}
            />
          </div>
        </div>
      )}
    </Animate>
  )
}

export default NmvTrackSegment
