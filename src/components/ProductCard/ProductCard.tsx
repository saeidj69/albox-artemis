'use client'

import { FC, memo, useMemo } from 'react'
import { useOnInView } from 'react-intersection-observer'

import Link from 'next/link'

import { ROUTES, TOMAN } from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'
import { Box } from 'iconsax-reactjs'

import CashbackBadge from '@/components/CashbackBadge'
import { useCashbackPreview } from '@/components/CashbackBadge/hooks/use-cashback-preview'
import SmartImage from '@/components/SmartImage'

import { AddToBasketIcon } from '@/modules/purchase/components/add-to-basket'

import { selectCashbackPercent } from '@/utils/cashback'
import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import { ProductCardProps } from './types'

const ProductCardComponent: FC<ProductCardProps> = (props) => {
  const { product, addToCartOptions, onProductOpen } = props

  const isAvailable = product?.purchasableQuantity > 0
  const cashbackPercent = selectCashbackPercent(
    isAvailable,
    product.totalCashback,
  )
  const {
    ref: cashbackBadgeRef,
    onVisible,
    needsVisibility,
  } = useCashbackPreview(cashbackPercent != null)
  const previewRef = useOnInView(onVisible, {
    threshold: 1,
    triggerOnce: true,
    skip: !needsVisibility,
  })

  const hasBoxDiscount =
    isAvailable && product?.boxRetailPrice > product?.boxDiscountedPrice

  const hasDiscount =
    isAvailable && product?.unitRetailPrice > product?.unitDiscountedPrice

  const productBadge = (() => {
    if (!isAvailable) {
      return 'اتمام موجودی'
    }

    if (product?.totalDiscount > 0) {
      return `٪${Math.ceil(product?.totalDiscount)}`
    }
  })()

  const productLink = useMemo(() => {
    return ROUTES.product(product.id)
  }, [product.id])

  const handleProductOpen = () => {
    track(EVENTS.PRODUCT_VIEWED, { plausible: true })
    onProductOpen?.()
  }

  return (
    <article
      ref={previewRef}
      data-slot="product-card"
      className={cn(
        'bg-background-main border-border-main rounded-brand relative overflow-hidden border p-3 pb-1',
      )}
    >
      {(productBadge != null || cashbackPercent != null) && (
        <div
          data-slot="product-card-badges"
          dir="ltr"
          className="absolute top-4 left-0 z-10 flex flex-col items-start gap-1"
        >
          {productBadge && (
            <Link
              href={productLink}
              prefetch={false}
              data-slot="product-card-badge"
              className={cn(
                'block text-center',
                'bg-error-main typo-label-medium min-w-8 rounded-r-lg px-1.5 pt-[5px] pb-[3px] text-white',
              )}
              onClick={handleProductOpen}
            >
              <span className="relative top-[0.5px]">{productBadge}</span>
            </Link>
          )}

          {cashbackPercent != null && (
            <CashbackBadge percent={cashbackPercent} ref={cashbackBadgeRef} />
          )}
        </div>
      )}

      <div
        data-slot="product-card-image"
        className="relative flex justify-center"
      >
        <div className="relative size-30">
          <Link
            href={productLink}
            prefetch={false}
            className="block h-full w-full"
            onClick={handleProductOpen}
          >
            <SmartImage
              fill
              alt={product?.name}
              media={product?.images?.[0]}
              preferredSize="md"
              sizes="120px"
              classNames={{
                image: cn('object-contain', !isAvailable && 'grayscale'),
              }}
            />
          </Link>
        </div>
      </div>

      <div className="relative">
        <div
          data-slot="product-card-add-to-cart"
          className="absolute -top-12 right-0 z-10"
        >
          <AddToBasketIcon
            product={product}
            disabled={!isAvailable}
            source="PC"
            options={addToCartOptions}
          />
        </div>

        <Link
          href={productLink}
          prefetch={false}
          data-slot="product-card-body"
          onClick={handleProductOpen}
        >
          <div className="typo-label-small text-text-primary my-2 line-clamp-2 min-h-12 leading-6">
            {product?.name}
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <div className="typo-body-x-small text-text-primary">تک:</div>

            <div className="flex items-center gap-1">
              {hasDiscount && (
                <div className="typo-body-x-small text-text-disabled line-through">
                  {isAvailable
                    ? formatPrice(toTomanPrice(product.unitRetailPrice))
                    : '−'}
                </div>
              )}

              <div className="typo-body-small text-text-primary">
                {isAvailable
                  ? formatPrice(toTomanPrice(product.unitDiscountedPrice))
                  : '−'}
              </div>
            </div>
          </div>

          <div className="border-border-main mt-1.5 border-t pt-1.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="text-primary-500 flex shrink-0 items-center gap-0.5">
                <Box className="size-3 shrink-0" />
                <span className="typo-label-x-small">
                  کارتن {persianDigits(product.unitInBox)} عددی
                </span>
              </div>

              {hasBoxDiscount && (
                <span className="text-text-secondary shrink-0 text-[12px] line-through">
                  {formatPrice(toTomanPrice(product.boxRetailPrice))}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-end gap-0.5">
              <div className="typo-label-x-large">
                {isAvailable
                  ? formatPrice(toTomanPrice(product.boxDiscountedPrice))
                  : '−'}
              </div>

              <div className="text-text-secondary typo-body-x-small">
                {TOMAN}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </article>
  )
}

export default memo(ProductCardComponent)
