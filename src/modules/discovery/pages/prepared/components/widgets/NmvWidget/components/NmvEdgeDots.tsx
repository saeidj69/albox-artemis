'use client'

import Animate from '@/components/Animate'

import { cn } from '@/lib/utils'

import { EDGE_DOT_STAGGER_MS } from './nmv-track-timing'

type NmvEdgeDotsProps = {
  count: number
  isActive: boolean
  startDelay: number
}

const NmvEdgeDots = (props: NmvEdgeDotsProps) => {
  const { count, isActive, startDelay } = props

  if (count <= 0) {
    return null
  }

  return (
    <div className="flex h-5 min-w-12 shrink-0 items-center justify-center gap-1">
      {Array.from({ length: count }, (_, index) => {
        const delayMs = startDelay + index * EDGE_DOT_STAGGER_MS

        return (
          <Animate
            key={index}
            animation="slideRight"
            delay={delayMs}
            duration={EDGE_DOT_STAGGER_MS * 3}
            className="flex size-1.5 items-center justify-center"
          >
            <div
              className={cn(
                'size-1.5 rounded-full',
                isActive
                  ? 'animate-nmv-edge-lit bg-background-disabled'
                  : 'bg-background-disabled',
              )}
              style={isActive ? { animationDelay: `${delayMs}ms` } : undefined}
            />
          </Animate>
        )
      })}
    </div>
  )
}

export default NmvEdgeDots
