'use client'

import { Fragment, useEffect, useRef } from 'react'

import {
  EVENTS,
  track,
  GtmTransformer,
  WETransformer,
} from '@/helpers/analytics'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Trash } from 'iconsax-reactjs'

import ActionSheet from '@/components/ActionSheet'
import BasketProductCard from '@/components/BasketProductCard'

import {
  useBasket,
  useBasketAlerts,
  useBasketCheckCall,
  type BasketCheckProduct,
} from '@/modules/purchase/hooks'
import type { ProductBasketLine } from '@/modules/purchase/types'

import Divider from '@/lib/Divider'
import IconButton from '@/lib/IconButton'
import { hideSheet, showSheet } from '@/lib/Sheet'

import BasketAddress from '../BasketAddress'
import BasketAlert from '../BasketAlert'
import BasketEmpty from '../BasketEmpty'
import BasketNationalCodeVerification from '../BasketNationalCodeVerification'
import BasketProductAlerts from './components/BasketProductAlerts'

const toViewCartLine = (
  product: BasketCheckProduct,
  localProduct: ProductBasketLine,
) => {
  const details = product.status === 'not_found' ? null : product.details

  return {
    product: {
      id: product.productId,
      name: details?.name || localProduct.title,
      unitInBox: details?.unitInBox ?? 1,
      boxDiscountedPrice: details?.netPrice ?? localProduct.priceWhenAdded,
      boxRetailPrice: details?.boxRetailPrice,
    },
    quantity: localProduct.quantity,
  }
}

const BasketProducts = () => {
  const { productLines } = useBasket()
  const { items: itemsWithAlerts, hasError } = useBasketAlerts()
  const { data, isChecking, clear } = useBasketCheckCall()
  const hasTrackedViewCart = useRef(false)

  const [parent] = useAutoAnimate()

  useEffect(() => {
    if (hasTrackedViewCart.current) return
    if (isChecking || !data || itemsWithAlerts.length === 0) return

    const lines = itemsWithAlerts.map(({ product, localProduct }) =>
      toViewCartLine(product, localProduct),
    )

    hasTrackedViewCart.current = true

    const ecommerce = GtmTransformer.toViewCart({ lines })

    track(EVENTS.VIEW_CART, {
      gtm: { ecommerce },
      webengage: WETransformer.toViewCart({
        lines,
        value: data.basket?.totalPrice ?? ecommerce.value,
      }),
    })
  }, [data, isChecking, itemsWithAlerts])

  const onClearBasket = () => {
    showSheet(ActionSheet, {
      title: 'حذف سبد خرید',
      description: 'آیا می خواهید سبد خرید خود را حذف کنید؟',
      actions: [
        {
          id: 'cancel',
          children: 'انصراف',
          variant: 'text',
          onClick: () => {
            hideSheet(ActionSheet)
          },
        },
        {
          id: 'clear-basket',
          children: 'حذف',
          variant: 'destructive',
          onClick: () => {
            clear()
            track(EVENTS.BASKET_CLEARED, { webengage: true })
            hideSheet(ActionSheet)
          },
        },
      ],
    })
  }

  const showEmptyState = !isChecking && productLines.length === 0
  const showSkeleton = productLines.length > 0 && !data

  if (showEmptyState) {
    return <BasketEmpty />
  }

  return (
    <div className="space-y-4" ref={parent}>
      <BasketNationalCodeVerification />

      {!hasError && <BasketAddress />}

      {hasError && <BasketAlert />}

      <div className="col-span-full flex items-center justify-between">
        <h2 className="typo-title-small text-text-primary">سبد خرید شما</h2>

        <IconButton variant="ghost" onClick={onClearBasket}>
          <Trash className="size-4" />
        </IconButton>
      </div>

      {itemsWithAlerts.map(({ product, localProduct, alerts }, index) => (
        <Fragment key={product.productId}>
          <BasketProductCard product={product} localProduct={localProduct}>
            <BasketProductAlerts
              productId={product.productId}
              alerts={alerts}
            />
          </BasketProductCard>

          {index !== itemsWithAlerts.length - 1 && <Divider />}
        </Fragment>
      ))}

      {showSkeleton && (
        <>
          <BasketProductCard.Skeleton />
          <Divider />
          <BasketProductCard.Skeleton />
          <Divider />
          <BasketProductCard.Skeleton />
          <Divider />
          <BasketProductCard.Skeleton />
        </>
      )}
    </div>
  )
}

export default BasketProducts
