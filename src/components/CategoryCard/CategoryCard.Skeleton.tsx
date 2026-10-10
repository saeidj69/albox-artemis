import { FC } from 'react'

import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { CategoryCardSkeletonProps } from './types'
import { categoryCardSkeletonVariants } from './variants'

const CategoryCardSkeletonComponent: FC<CategoryCardSkeletonProps> = (
  props,
) => {
  const { className, classNames } = props

  const slots = categoryCardSkeletonVariants()

  return (
    <div
      data-slot="category-card-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <AspectRatio
        data-slot="category-card-skeleton-aspect-ratio"
        className={slots.aspectRatio({
          className: classNames?.aspectRatio,
        })}
      >
        <Skeleton
          data-slot="category-card-skeleton-image"
          className={slots.image({ className: classNames?.image })}
        />
      </AspectRatio>

      <Skeleton
        data-slot="category-card-skeleton-title"
        className={slots.title({ className: classNames?.title })}
      />
    </div>
  )
}

export default CategoryCardSkeletonComponent
