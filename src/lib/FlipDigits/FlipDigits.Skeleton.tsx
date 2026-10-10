import { type FC } from 'react'

import Skeleton from '@/lib/Skeleton'

import { cn } from '../utils'
import type { FlipDigitsSkeletonProps } from './types'
import { flipDigitsSkeletonVariants } from './variants'

const FlipDigitsSkeletonComponent: FC<FlipDigitsSkeletonProps> = (props) => {
  const { className, classNames, digits = 2 } = props

  const slots = flipDigitsSkeletonVariants()

  return (
    <div
      data-slot="flip-digits-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {Array.from({ length: digits }, (_, i) => (
        <Skeleton
          key={i}
          data-slot="flip-digits-skeleton-digit"
          className={slots.digit({ className: classNames?.digit })}
        />
      ))}
    </div>
  )
}

export default FlipDigitsSkeletonComponent
