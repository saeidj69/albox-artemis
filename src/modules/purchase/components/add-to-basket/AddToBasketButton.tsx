'use client'

import { memo, type FC } from 'react'

import { cn } from '@/lib/utils'

import { addToBasketVariants } from './add-to-basket.variants'
import QuantityControls from './components/quantity-controls'
import { useAddToBasket } from './hooks/use-add-to-basket'
import type { AddToBasketButtonProps } from './types'

const AddToBasketButtonComponent: FC<AddToBasketButtonProps> = (props) => {
  const {
    product,
    confirmRemove,
    source,
    onFirstAdd,
    variant = 'primary',
    size = 'default',
    disabled,
    classNames,
  } = props

  const { quantity, atMax, onIncrement, onDecrement, longPressHandlers } =
    useAddToBasket({ product, confirmRemove, source, onFirstAdd })

  const slots = addToBasketVariants({ variant, size, disabled })

  if (disabled) {
    return (
      <div
        data-slot="add-to-basket-button"
        aria-disabled
        className={slots.root({ className: classNames?.root })}
      >
        <span className={slots.label({ className: classNames?.label })}>
          در حال تامین
        </span>
      </div>
    )
  }

  return (
    <div
      role="button"
      data-slot="add-to-basket-button"
      className={cn(
        slots.root({ className: classNames?.root }),
        'touch-manipulation select-none [-webkit-touch-callout:none]',
        'w-full justify-between',
      )}
      {...longPressHandlers}
    >
      {quantity === 0 ? (
        <span className={slots.label({ className: classNames?.label })}>
          افزودن به سبد خرید
        </span>
      ) : (
        <QuantityControls
          atMax={atMax}
          slots={slots}
          quantity={quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          classNames={classNames}
        />
      )}
    </div>
  )
}

export default memo(AddToBasketButtonComponent)
