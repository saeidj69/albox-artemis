import { type FC } from 'react'

import Skeleton from '@/lib/Skeleton'

import { cn } from '../utils'
import type { InputSkeletonProps } from './types'
import { inputSkeletonVariants } from './variants'

const InputSkeletonComponent: FC<InputSkeletonProps> = (props) => {
  const { className, classNames } = props

  const slots = inputSkeletonVariants()

  return (
    <div
      data-slot="input-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <Skeleton
        data-slot="input-skeleton-label"
        className={slots.label({ className: classNames?.label })}
      />
      <Skeleton
        data-slot="input-skeleton-field"
        className={slots.field({ className: classNames?.field })}
      />
    </div>
  )
}

export default InputSkeletonComponent
