'use client'

import { memo, type FC, useMemo } from 'react'

import { Add } from 'iconsax-reactjs'

import { cn } from '@/lib/utils'

import { addToBasketVariants } from './add-to-basket.variants'
import PreviewLabel from './components/preview-label'
import QuantityControls from './components/quantity-controls'
import { useAddToBasket } from './hooks/use-add-to-basket'
import { useIconPreview } from './hooks/use-icon-preview'
import type { AddToBasketIconProps } from './types'

const AddToBasketIconComponent: FC<AddToBasketIconProps> = (props) => {
  const {
    product,
    confirmRemove,
    source,
    options,
    size = 'default',
    disabled,
    classNames,
  } = props

  const {
    quantity,
    atMax,
    onIncrement,
    onDecrement,
    longPressHandlers,
    stopCardNavigation,
  } = useAddToBasket({
    product,
    confirmRemove,
    source,
    onFirstAdd: options?.onFirstAdd,
  })

  const previewEnabled = Boolean(options?.preview && quantity === 0)
  const { isExpanded, showLabel } = useIconPreview({ enabled: previewEnabled })
  const isWide = quantity > 0 || isExpanded

  const slots = addToBasketVariants({
    disabled,
    size,
    variant: 'icon',
    expanded: isWide,
    previewLabelVisible: showLabel,
  })

  const quantityControls = useMemo(
    () => (
      <QuantityControls
        atMax={atMax}
        slots={slots}
        animation={false}
        quantity={quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        classNames={classNames}
      />
    ),
    [atMax, classNames, onDecrement, onIncrement, quantity, slots],
  )

  const idleContent = (
    <>
      <div className="flex h-full w-10 shrink-0 translate-x-px items-center justify-center">
        <Add className={slots.icon({ className: classNames?.icon })} />
      </div>

      {options?.preview && (
        <PreviewLabel
          showLabel={showLabel}
          className={slots.previewLabel({
            className: classNames?.previewLabel,
          })}
          labelClassName={slots.label({ className: classNames?.label })}
        />
      )}
    </>
  )

  if (disabled) {
    return (
      <div
        data-slot="add-to-basket-icon"
        aria-disabled
        className={cn(slots.root({ className: classNames?.root }), 'max-w-10')}
        onClick={stopCardNavigation}
      >
        <div className="flex h-full w-10 items-center justify-center">
          <Add className={slots.icon({ className: classNames?.icon })} />
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      data-slot="add-to-basket-icon"
      className={slots.root({ className: classNames?.root })}
      {...longPressHandlers}
    >
      {quantity > 0 ? quantityControls : idleContent}
    </div>
  )
}

export default memo(AddToBasketIconComponent)
