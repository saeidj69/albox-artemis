'use client'

import { memo, type FC } from 'react'

import { Trash, Add, Minus } from 'iconsax-reactjs'

import Animate from '@/components/Animate'

import FlipDigits from '@/lib/FlipDigits'
import { cn } from '@/lib/utils'

import type { addToBasketVariants } from '../add-to-basket.variants'
import type { AddToBasketButtonProps, AddToBasketCartState } from '../types'

type QuantityControlsProps = Pick<
  AddToBasketCartState,
  'quantity' | 'atMax' | 'onIncrement' | 'onDecrement'
> & {
  slots: ReturnType<typeof addToBasketVariants>
  classNames?: AddToBasketButtonProps['classNames']
  animation?: boolean
}

const QuantityControlsComponent: FC<QuantityControlsProps> = (props) => {
  const {
    quantity,
    atMax,
    onIncrement,
    onDecrement,
    slots,
    classNames,
    animation = true,
  } = props

  return (
    <>
      <Animate
        animation="slideLeft"
        className="h-full shrink-0"
        duration={animation ? 100 : 0}
      >
        <button
          type="button"
          aria-label="افزودن"
          aria-disabled={atMax}
          className={cn(
            'flex h-full cursor-pointer flex-col items-center justify-center px-2',
            atMax && 'cursor-not-allowed opacity-50',
          )}
          onClick={onIncrement}
        >
          <Add className={slots.icon({ className: classNames?.icon })} />
        </button>
      </Animate>

      <Animate
        animation="scaleIn"
        className="min-w-6 text-center"
        duration={animation ? 100 : 0}
      >
        <FlipDigits
          value={quantity}
          minDigits={1}
          classNames={{
            root: cn('shrink-0', slots.icon({ className: classNames?.icon })),
          }}
        />
      </Animate>

      <Animate
        animation="slideRight"
        className="h-full shrink-0"
        duration={animation ? 100 : 0}
      >
        <button
          type="button"
          aria-label="کم کردن"
          className="flex h-full cursor-pointer flex-col items-center justify-center px-2"
          onClick={onDecrement}
        >
          {quantity > 1 ? (
            <Minus className={slots.icon({ className: classNames?.icon })} />
          ) : (
            <Trash className={slots.icon({ className: classNames?.icon })} />
          )}
        </button>
      </Animate>
    </>
  )
}

export default memo(QuantityControlsComponent)
