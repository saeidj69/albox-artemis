import type { FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { NumberWheelSkeletonProps } from './types'
import { numberWheelSkeletonVariants } from './variants'

const DEFAULT_HEIGHT = 72

const NumberWheelSkeletonComponent: FC<NumberWheelSkeletonProps> = (props) => {
  const { height = DEFAULT_HEIGHT, className, classNames, ...rest } = props

  const slots = numberWheelSkeletonVariants()

  return (
    <Skeleton
      data-slot="number-wheel-skeleton"
      className={cn(slots.root({ className: classNames?.root }), className)}
      style={{ height }}
      {...rest}
    />
  )
}

export default NumberWheelSkeletonComponent
