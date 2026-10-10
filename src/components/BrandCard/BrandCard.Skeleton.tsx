import { FC } from 'react'

import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { BrandCardSkeletonProps } from './types'
import { brandCardSkeletonVariants } from './variants'

const BrandCardSkeletonComponent: FC<BrandCardSkeletonProps> = (props) => {
  const { className, classNames } = props

  const slots = brandCardSkeletonVariants()

  return (
    <div
      data-slot="brand-card-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <div
        data-slot="brand-card-skeleton-image-container"
        className={slots.imageContainer({
          className: classNames?.imageContainer,
        })}
      >
        <AspectRatio
          data-slot="brand-card-skeleton-aspect-ratio"
          ratio={1}
          className={slots.aspectRatio({
            className: classNames?.aspectRatio,
          })}
        >
          <Skeleton
            data-slot="brand-card-skeleton-image"
            className={slots.image({ className: classNames?.image })}
          />
        </AspectRatio>
      </div>

      <Skeleton
        data-slot="brand-card-skeleton-title"
        className={slots.title({ className: classNames?.title })}
      />
    </div>
  )
}

export default BrandCardSkeletonComponent
