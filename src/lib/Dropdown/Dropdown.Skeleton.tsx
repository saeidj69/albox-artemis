import { type FC } from 'react'

import Skeleton from '@/lib/Skeleton'

import { cn } from '../utils'
import type { DropdownSkeletonProps } from './types'
import { dropdownSkeletonVariants } from './variants'

const DropdownSkeletonComponent: FC<DropdownSkeletonProps> = (props) => {
  const { size, className, classNames } = props

  const slots = dropdownSkeletonVariants({ size })

  return (
    <div
      data-slot="dropdown-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <Skeleton
        data-slot="dropdown-skeleton-label"
        className={slots.label({ className: classNames?.label })}
      />
      <Skeleton
        data-slot="dropdown-skeleton-field"
        className={slots.field({ className: classNames?.field })}
      />
    </div>
  )
}

export default DropdownSkeletonComponent
