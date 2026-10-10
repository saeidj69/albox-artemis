import { FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import { ChipSkeletonProps } from './types'
import { chipSkeletonVariants } from './variants'

const ChipSkeletonComponent: FC<ChipSkeletonProps> = (props) => {
  const { className, classNames, size = 'medium', ...otherProps } = props

  const slots = chipSkeletonVariants({ size })

  return (
    <Skeleton
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...otherProps}
    />
  )
}

export default ChipSkeletonComponent
