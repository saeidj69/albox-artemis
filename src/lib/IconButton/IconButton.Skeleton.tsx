import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { IconButtonSkeletonProps } from './types'
import { iconButtonSkeletonVariants } from './variants'

/**
 * IconButton skeleton placeholder for loading state.
 */
const IconButtonSkeletonComponent: FC<IconButtonSkeletonProps> = (props) => {
  const { className, classNames, size = 'medium', ...otherProps } = props

  const slots = iconButtonSkeletonVariants({ size })

  return (
    <Skeleton
      data-slot="icon-button-skeleton"
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...otherProps}
    />
  )
}

export default IconButtonSkeletonComponent
