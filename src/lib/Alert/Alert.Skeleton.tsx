import Skeleton from '../Skeleton'
import type { AlertSkeletonProps } from './types'
import { alertSkeletonVariants } from './variants'

const AlertSkeletonComponent = (props: AlertSkeletonProps) => {
  const { ref, className, classNames, ...otherProps } = props

  const slots = alertSkeletonVariants()

  return (
    <div
      ref={ref}
      data-slot="alert-skeleton"
      className={slots.root({ className: classNames?.root ?? className })}
      {...otherProps}
    >
      <Skeleton
        data-slot="alert-skeleton-icon"
        className={slots.icon({ className: classNames?.icon })}
      />

      <div
        data-slot="alert-skeleton-content"
        className={slots.content({ className: classNames?.content })}
      >
        <Skeleton
          data-slot="alert-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />
        <Skeleton
          data-slot="alert-skeleton-description"
          className={slots.description({ className: classNames?.description })}
        />
      </div>
    </div>
  )
}

export default AlertSkeletonComponent
