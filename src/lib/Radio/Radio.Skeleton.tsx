import { type FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { RadioGroupSkeletonProps } from './types'
import { radioGroupSkeletonVariants } from './variants'

const RadioGroupSkeletonComponent: FC<RadioGroupSkeletonProps> = (props) => {
  const { className, classNames, count = 3 } = props

  const slots = radioGroupSkeletonVariants()

  return (
    <div
      data-slot="radio-group-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          data-slot="radio-group-skeleton-item"
          className={slots.item({ className: classNames?.item })}
        />
      ))}
    </div>
  )
}

export default RadioGroupSkeletonComponent
