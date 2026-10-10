import { cn } from '../utils'
import type { SkeletonProps } from './types'
import { skeletonVariants } from './variants'

/**
 * # Skeleton
 * @param props - SkeletonProps
 * @description Use to show a placeholder while content is loading.
 * @example
 * <Skeleton className="h-4 w-full" />
 */
const Skeleton = (props: SkeletonProps) => {
  const { className, ref, classNames, ...otherProps } = props

  const slots = skeletonVariants()

  return (
    <div
      ref={ref}
      data-slot="skeleton"
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...otherProps}
    />
  )
}

export default Skeleton

export type { SkeletonProps }
