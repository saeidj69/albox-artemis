import type { FC } from 'react'

import Skeleton from '@/lib/Skeleton'

import { cn } from '../utils'
import type { CountdownSkeletonProps } from './types'
import { countdownSkeletonVariants } from './variants'

const SEGMENT_COUNT = 3

const CountdownSkeletonComponent: FC<CountdownSkeletonProps> = (props) => {
  const { ref, size = 'medium', className, classNames, ...rest } = props

  const slots = countdownSkeletonVariants({ size })

  return (
    <div
      ref={ref}
      data-slot="countdown-skeleton"
      data-size={size}
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...rest}
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
        <Skeleton
          key={index}
          data-slot="countdown-skeleton-segment"
          className={slots.segment({ className: classNames?.segment })}
        />
      ))}
    </div>
  )
}

export default CountdownSkeletonComponent
