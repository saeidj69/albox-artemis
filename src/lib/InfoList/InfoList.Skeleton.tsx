import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils/cn'

import type { InfoListSkeletonProps } from './types'
import { infoListSkeletonVariants } from './variants'

const InfoListSkeletonComponent = (props: InfoListSkeletonProps) => {
  const {
    ref,
    rowCount = 4,
    variant,
    className,
    classNames,
    ...otherProps
  } = props

  const slots = infoListSkeletonVariants({ variant })

  return (
    <div
      ref={ref}
      data-slot="info-list-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      {Array.from({ length: rowCount }).map((_, index) => {
        const isAlt = index % 2 === 0

        return (
          <div
            key={index}
            data-slot="info-list-skeleton-row"
            className={slots.row({
              className: cn(
                classNames?.row,
                isAlt && slots.rowAlt({ className: classNames?.rowAlt }),
              ),
            })}
          >
            <Skeleton
              className={slots.label({ className: classNames?.label })}
            />
            <Skeleton
              className={slots.value({ className: classNames?.value })}
            />
          </div>
        )
      })}
    </div>
  )
}

export default InfoListSkeletonComponent

export type { InfoListSkeletonProps }
