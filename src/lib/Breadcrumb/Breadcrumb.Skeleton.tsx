import { Fragment, type FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { BreadcrumbSkeletonProps } from './types'
import { breadcrumbSkeletonVariants } from './variants'

const BreadcrumbSkeletonComponent: FC<BreadcrumbSkeletonProps> = (props) => {
  const { className, classNames, segmentCount = 4 } = props

  const slots = breadcrumbSkeletonVariants()
  const safeCount = Math.max(1, segmentCount)

  return (
    <div
      aria-hidden
      data-slot="breadcrumb-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {Array.from({ length: safeCount }, (_, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <Skeleton
              data-slot="breadcrumb-skeleton-separator"
              className={slots.separator({
                className: classNames?.separator,
              })}
            />
          )}
          <Skeleton
            data-slot="breadcrumb-skeleton-segment"
            className={slots.segment({
              className: classNames?.segment,
            })}
          />
        </Fragment>
      ))}
    </div>
  )
}

export default BreadcrumbSkeletonComponent
