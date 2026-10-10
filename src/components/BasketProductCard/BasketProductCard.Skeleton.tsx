import { FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { BasketProductCardSkeletonProps } from './types'
import { basketProductCardSkeletonVariants } from './variants'

const BasketProductCardSkeletonComponent: FC<BasketProductCardSkeletonProps> = (
  props,
) => {
  const { className, classNames, ref, ...rest } = props

  const slots = basketProductCardSkeletonVariants()

  return (
    <div
      ref={ref}
      data-slot="basket-product-card-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <Skeleton
        data-slot="basket-product-card-skeleton-image"
        className={slots.imageWrapper({ className: classNames?.imageWrapper })}
      />

      <div
        data-slot="basket-product-card-skeleton-body"
        className={slots.body({ className: classNames?.body })}
      >
        <Skeleton
          data-slot="basket-product-card-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />

        <Skeleton
          data-slot="basket-product-card-skeleton-chip"
          className={slots.chip({ className: classNames?.chip })}
        />

        <div
          data-slot="basket-product-card-skeleton-footer"
          className={slots.footer({ className: classNames?.footer })}
        >
          <Skeleton
            data-slot="basket-product-card-skeleton-add-to-cart"
            className={slots.addToCart({ className: classNames?.addToCart })}
          />

          <div
            data-slot="basket-product-card-skeleton-price"
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

export default BasketProductCardSkeletonComponent
