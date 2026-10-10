import { FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { ProductCardSkeletonProps } from './types'
import { productCardSkeletonVariants } from './variants'

const ProductCardSkeletonComponent: FC<ProductCardSkeletonProps> = (props) => {
  const { className, classNames, ref, ...rest } = props

  const slots = productCardSkeletonVariants()

  return (
    <article
      ref={ref}
      data-slot="product-card-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <div
        data-slot="product-card-skeleton-image"
        className={slots.imageSection({
          className: classNames?.imageSection,
        })}
      >
        <div
          className={slots.imageInner({ className: classNames?.imageInner })}
        >
          <Skeleton
            data-slot="product-card-skeleton-image-placeholder"
            className={slots.image({ className: classNames?.image })}
          />
        </div>
      </div>

      <div
        data-slot="product-card-skeleton-body"
        className={cn(slots.body({ className: classNames?.body }), 'pt-0.5')}
      >
        <Skeleton
          data-slot="product-card-skeleton-title"
          className="my-4 h-4 w-full rounded-md"
        />

        <div
          data-slot="product-card-skeleton-unit-price-row"
          className={slots.unitPriceRow({
            className: classNames?.unitPriceRow,
          })}
        >
          <Skeleton
            className={slots.unitPriceLabel({
              className: classNames?.unitPriceLabel,
            })}
          />

          <Skeleton
            className={slots.unitPriceLabel({
              className: classNames?.unitPriceLabel,
            })}
          />
        </div>

        <div
          data-slot="product-card-skeleton-border-section"
          className={slots.borderSection({
            className: classNames?.borderSection,
          })}
        >
          <div className={slots.chipRow({ className: classNames?.chipRow })}>
            <Skeleton
              className={slots.boxStrike({ className: classNames?.boxStrike })}
            />
          </div>

          <div className="flex items-center justify-end">
            <Skeleton className="mt-4 mb-3 h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  )
}

export default ProductCardSkeletonComponent
