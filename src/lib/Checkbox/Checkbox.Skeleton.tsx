import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { CheckboxSkeletonProps } from './types'
import { checkboxSkeletonVariants } from './variants'

const CheckboxSkeletonComponent: FC<CheckboxSkeletonProps> = (props) => {
  const { className, classNames } = props

  const slots = checkboxSkeletonVariants()

  return (
    <Skeleton
      data-slot="checkbox-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    />
  )
}

export default CheckboxSkeletonComponent
