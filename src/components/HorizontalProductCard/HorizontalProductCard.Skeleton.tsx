import { FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { HorizontalProductCardSkeletonProps } from './types'
import { horizontalProductCardSkeletonVariants } from './variants'

const HorizontalProductCardSkeletonComponent: FC<
  HorizontalProductCardSkeletonProps
> = (props) => {
  const { className, classNames, ref, ...rest } = props

  const slots = horizontalProductCardSkeletonVariants()

  return (
    <div
      ref={ref}
      data-slot="horizontal-product-card-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <Skeleton
        data-slot="horizontal-product-card-skeleton-image"
        className={slots.imageWrapper({ className: classNames?.imageWrapper })}
      />

      <div
        data-slot="horizontal-product-card-skeleton-body"
        className={slots.body({ className: classNames?.body })}
      >
        <Skeleton
          data-slot="horizontal-product-card-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />

        <Skeleton
          data-slot="horizontal-product-card-skeleton-chip"
          className={slots.chip({ className: classNames?.chip })}
        />

        <div
          data-slot="horizontal-product-card-skeleton-footer"
          className={slots.footer({ className: classNames?.footer })}
        >
          <Skeleton
            data-slot="horizontal-product-card-skeleton-add-to-cart"
            className={slots.addToCart({ className: classNames?.addToCart })}
          />

          <div
            data-slot="horizontal-product-card-skeleton-price"
            className={slots.price({ className: classNames?.price })}
          >
            <Skeleton
              className={slots.strikethrough({
                className: classNames?.strikethrough,
              })}
            />
            <Skeleton
              className={slots.priceValue({
                className: classNames?.priceValue,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HorizontalProductCardSkeletonComponent
