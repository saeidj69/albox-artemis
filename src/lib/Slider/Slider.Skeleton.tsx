import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { SliderSkeletonProps } from './types'
import { sliderSkeletonVariants } from './variants'

const SliderSkeletonComponent: FC<SliderSkeletonProps> = (props) => {
  const { className, classNames } = props

  const slots = sliderSkeletonVariants()

  return (
    <Skeleton
      data-slot="slider-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    />
  )
}

export default SliderSkeletonComponent
