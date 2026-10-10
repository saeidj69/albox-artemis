import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { TextAreaSkeletonProps } from './types'
import { textAreaSkeletonVariants } from './variants'

const TextAreaSkeletonComponent: FC<TextAreaSkeletonProps> = (props) => {
  const { className, classNames } = props

  const slots = textAreaSkeletonVariants()

  return (
    <div
      data-slot="text-area-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <Skeleton
        data-slot="text-area-skeleton-label"
        className={slots.label({ className: classNames?.label })}
      />
      <Skeleton
        data-slot="text-area-skeleton-field"
        className={slots.field({ className: classNames?.field })}
      />
    </div>
  )
}

export default TextAreaSkeletonComponent
