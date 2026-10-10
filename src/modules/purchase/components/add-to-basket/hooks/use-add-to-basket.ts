'use client'

import { useCallback } from 'react'

import { EVENTS, track, GtmTransformer } from '@/helpers/analytics'
import { useLongPress } from '@/hooks/useLongPress'
import { useProgress } from '@bprogress/next'
import { toast } from 'sonner'

import ActionSheet from '@/components/ActionSheet'

import { useBasketEntity } from '@/modules/purchase/hooks'

import { persianDigits } from '@/utils/numbers'

import type { ListingProductSummary } from '@/api/models'

import { hideSheet, showSheet } from '@/lib/Sheet'

import QuantityPickerSheet from '../components/quantity-picker-sheet'
import type { PressNavigateEvent } from '../types'

const trackRemoveFromCart = (product: ListingProductSummary) => {
  track(EVENTS.REMOVE_FROM_CART, {
    gtm: {
      ecommerce: GtmTransformer.toRemoveFromCart({ product, quantity: 1 }),
    },
  })
}

type UseAddToBasketOptions = {
  product: ListingProductSummary
  confirmRemove?: boolean
  source?: 'PC' | 'PDP'
  onFirstAdd?: () => void
}

/**
 * Shared cart-state + interaction logic for every add-to-basket surface
 * (default button, icon variant). One hook, so long-press → quantity
 * picker, the confirm-remove sheet, analytics, and the cart-fly animation
 * behave identically everywhere instead of being re-implemented per
 * component.
 */
export function useAddToBasket({
  product,
  confirmRemove = false,
  source,
  onFirstAdd,
}: UseAddToBasketOptions) {
  const progress = useProgress()
  const { quantity, add, remove, setQuantity } = useBasketEntity(
    'product',
    product.id,
  )

  const stopCardNavigation = useCallback(
    (e: PressNavigateEvent) => {
      progress.stop()
      e.preventDefault()
      e.stopPropagation()
    },
    [progress],
  )

  const maxQty = product.purchasableQuantity
  const canAdd = maxQty > 0
  const atMax = quantity >= maxQty

  const onIncrement = useCallback(
    (e: PressNavigateEvent) => {
      stopCardNavigation(e)
      if (!canAdd) {
        toast.info('این محصول در حال حاضر موجود نیست.')
        return
      }
      if (atMax) {
        toast.info(`حداکثر خرید این کالا ${persianDigits(maxQty)} کارتن است.`)
        return
      }

      add({
        quantity: 1,
        title: product.name,
        priceWhenAdded: product.boxDiscountedPrice,
      })

      track(EVENTS.ADD_TO_CART, {
        gtm: {
          ecommerce: GtmTransformer.toAddToCart({ product, quantity: 1 }),
        },
      })
      track(EVENTS.BASKET_INITIATED, { webengage: true })

      if (quantity === 0) {
        onFirstAdd?.()
      }

      if (source) {
        const sourceMap = {
          PC: 'product_card',
          PDP: 'product_single_page',
        } as const
        track(EVENTS.ADDED_TO_BASKET, {
          plausible: { source: sourceMap[source] },
        })
      }
    },
    [
      atMax,
      canAdd,
      maxQty,
      product,
      source,
      add,
      stopCardNavigation,
      quantity,
      onFirstAdd,
    ],
  )

  const onDecrement = useCallback(
    (e: PressNavigateEvent) => {
      stopCardNavigation(e)

      if (confirmRemove && quantity === 1) {
        showSheet(ActionSheet, {
          title: 'حذف از سبد',
          description: `آیا از حذف «${product.name}» از سبد خرید مطمئن هستید؟`,
          actions: [
            {
              id: 'cancel',
              variant: 'text',
              children: 'انصراف',
              className: 'w-full',
              onClick: () => hideSheet(ActionSheet),
            },
            {
              id: 'confirm',
              variant: 'destructive',
              children: 'بله، حذف کن',
              className: 'w-full',
              onClick: () => {
                remove()
                trackRemoveFromCart(product)
                track(EVENTS.ADDED_TO_BASKET, {
                  plausible: { source: 'product_removed' },
                })
                hideSheet(ActionSheet)
              },
            },
          ],
        })
        return
      }

      if (quantity === 1) {
        trackRemoveFromCart(product)
        track(EVENTS.ADDED_TO_BASKET, {
          plausible: { source: 'product_removed' },
        })
        remove()
      } else {
        track(EVENTS.ADDED_TO_BASKET, {
          plausible: { source: 'product_decreased' },
        })
        setQuantity(quantity - 1)
      }
    },
    [confirmRemove, product, quantity, remove, setQuantity, stopCardNavigation],
  )

  const onButtonClick = useCallback(
    (e: PressNavigateEvent) => {
      stopCardNavigation(e)
      if (quantity === 0) onIncrement(e)
    },
    [onIncrement, quantity, stopCardNavigation],
  )

  const openQuantityPicker = useCallback(() => {
    if (!canAdd) {
      toast.info('این محصول در حال حاضر موجود نیست.')
      return
    }
    showSheet(QuantityPickerSheet, {
      product,
      initialQuantity: quantity || 1,
      onConfirm: (qty: number) => {
        setQuantity(qty)
        if (qty > quantity) {
          track(EVENTS.BASKET_INITIATED, { webengage: true })
        }
        if (quantity === 0 && qty > 0) {
          onFirstAdd?.()
        }
      },
    })
  }, [canAdd, onFirstAdd, product, quantity, setQuantity])

  const longPressHandlers = useLongPress({
    disabled: !canAdd,
    duration: 450,
    moveThreshold: 14,
    onClick: onButtonClick,
    onLongPress: openQuantityPicker,
  })

  return {
    atMax,
    quantity,
    onIncrement,
    onDecrement,
    longPressHandlers,
    stopCardNavigation,
  }
}
