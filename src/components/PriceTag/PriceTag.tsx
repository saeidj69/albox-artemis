import { type FC } from 'react'

import { TOMAN } from '@/constants'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import type { PriceTagProps } from './types'
import { priceTagVariants } from './variants'

const PriceTagComponent: FC<PriceTagProps> = (props) => {
  const { ref, product, className, classNames, ...rest } = props

  const slots = priceTagVariants()

  const isAvailable = product?.purchasableQuantity > 0
  const hasDiscount = product?.totalDiscount > 0
  const price = product?.boxDiscountedPrice
  const retailPrice = product?.boxRetailPrice
  const discount = product?.totalDiscount

  return (
    <div
      ref={ref}
      data-slot="price-tag"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      {hasDiscount && retailPrice != null && (
        <div
          data-slot="price-tag-discount-row"
          className={slots.discountRow({ className: classNames?.discountRow })}
        >
          <span
            data-slot="price-tag-badge"
            className={slots.badge({ className: classNames?.badge })}
          >
            <span className="relative top-[0.5px]">٪{Math.ceil(discount)}</span>
          </span>
          <span
            data-slot="price-tag-strikethrough"
            className={slots.strikethrough({
              className: classNames?.strikethrough,
            })}
          >
            {isAvailable ? formatPrice(toTomanPrice(retailPrice)) : '−'}
          </span>
        </div>
      )}

      <div
        data-slot="price-tag-price-row"
        className={slots.priceRow({ className: classNames?.priceRow })}
      >
        <span
          data-slot="price-tag-price"
          className={slots.price({ className: classNames?.price })}
        >
          {isAvailable ? formatPrice(toTomanPrice(price)) : '−'}
        </span>
        <span
          data-slot="price-tag-currency"
          className={slots.currency({ className: classNames?.currency })}
        >
          {TOMAN}
        </span>
      </div>
    </div>
  )
}

export default PriceTagComponent
