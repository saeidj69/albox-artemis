import { FC } from 'react'

import { cn } from '@/lib/utils'

type NmvProgressProps = {
  /** Should be a number between 0 and 100 */
  progress: number
  variant: 'line' | 'circle'

  /** Pulse shimmer on the in-progress segment */
  enableAnimation?: boolean
  /** Delay before the fill starts traveling */
  fillDelayMs?: number
  /** Duration of the 0 → progress width travel */
  fillDurationMs?: number
}

const NmvProgress: FC<NmvProgressProps> = (props) => {
  const {
    progress,
    variant,
    enableAnimation = true,
    fillDelayMs = 0,
    fillDurationMs = 600,
  } = props

  switch (variant) {
    case 'circle':
      return (
        <div
          className={cn(
            'bg-background-disabled size-1.5 rounded-full',
            progress === 100 && 'bg-primary-400',
          )}
        />
      )

    case 'line':
      return (
        <div
          className={cn(
            'bg-background-disabled relative h-1.5 w-full rounded-full',
          )}
        >
          <div
            className={cn(
              'bg-primary-400 absolute top-0 right-0 h-full origin-right rounded-full',
            )}
            style={{
              width: `${progress}%`,
              ...(progress > 0 && fillDurationMs > 0
                ? {
                    animationName: 'nmv-progress-fill',
                    animationDuration: `${fillDurationMs}ms`,
                    animationDelay: `${fillDelayMs}ms`,
                    animationTimingFunction: 'linear',
                    animationFillMode: 'both',
                  }
                : undefined),
            }}
          >
            {enableAnimation && progress > 0 && progress < 100 ? (
              <div
                className={cn(
                  'bg-primary-400 size-full animate-pulse rounded-full',
                )}
              />
            ) : null}
          </div>
        </div>
      )
    default:
      return null
  }
}

export default NmvProgress
