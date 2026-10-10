'use client'

import { FC, memo, useMemo } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'
import { Box } from 'iconsax-reactjs'

import CashbackBadge from '@/components/CashbackBadge'
import PriceTag from '@/components/PriceTag'
import SmartImage from '@/components/SmartImage'

import { AddToBasketButton } from '@/modules/purchase/components/add-to-basket'

import { selectCashbackPercent } from '@/utils/cashback'
import { persianDigits } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import { toListingProduct } from './to-listing-product'
import { BasketProductCardProps } from './types'
import { basketProductCardVariants } from './variants'

const BasketProductCardComponent: FC<BasketProductCardProps> = (props) => {
  const {
    product,
    className,
    localProduct,
    children,
    classNames,
    ref,
    ...rest
  } = props

  const listingProduct = useMemo(
    () => toListingProduct(product, localProduct),
    [product, localProduct],
  )

  // Match checkout: quantity_cap (`error` + maxQty > 0) stays interactive;
  // only not_found / out_of_stock (maxQty === 0) show the issue block.
  const maxPurchaseQuantity =
    product.status !== 'not_found'
      ? (product.details?.maxPurchaseQuantity ?? 0)
      : 0
  const isUnavailable =
    product.status === 'not_found' ||
    (product.status === 'error' && maxPurchaseQuantity === 0)
  const displayState = isUnavailable ? product.status : 'ok'
  const cashbackPercentage =
    selectCashbackPercent(
      !isUnavailable,
      product.status !== 'not_found' ? product.details.cashbackPercentage : 0,
    ) ?? 0
  const slots = basketProductCardVariants({ state: displayState })
  const issueLabel =
    product.status === 'not_found' ? 'ناموجود' : 'غیر قابل خرید'

  const productLink = ROUTES.product(listingProduct.id)
  const trackProductView = () =>
    track(EVENTS.PRODUCT_VIEWED, { plausible: true })

  return (
    <div
      ref={ref}
      data-slot="basket-product-card"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <article
        data-slot="basket-product-card-article"
        className={slots.article({ className: classNames?.article })}
      >
        <Link
          href={productLink}
          data-slot="basket-product-card-image"
          className={slots.imageWrapper({
            className: classNames?.imageWrapper,
          })}
          prefetch={false}
          onClick={trackProductView}
        >
          <SmartImage
            alt={listingProduct.name}
            media={listingProduct.images?.[0]}
            preferredSize="md"
            fill
            sizes="80px"
            classNames={{
              image: slots.image({ className: classNames?.image }),
            }}
          />
        </Link>

        <div
          data-slot="basket-product-card-body"
          className={slots.body({ className: classNames?.body })}
        >
          <Link
            href={productLink}
            data-slot="basket-product-card-title"
            className={slots.title({
              className: cn('block', classNames?.title),
            })}
            onClick={trackProductView}
          >
            {listingProduct.name}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-primary-500 flex shrink-0 items-center gap-0.5">
              <Box className="size-3 shrink-0" />
              <span className="typo-label-x-small">
                کارتن {persianDigits(listingProduct.unitInBox)} عددی
              </span>
            </div>
            {!isUnavailable && cashbackPercentage > 0 && (
              <CashbackBadge
                shape="pill"
                alwaysExpanded
                percent={cashbackPercentage}
              />
            )}
          </div>

          {isUnavailable ? (
            <div
              data-slot="basket-product-card-issue"
              className={slots.issue({ className: classNames?.issue })}
            >
              <p
                data-slot="basket-product-card-issue-label"
                className={slots.issueLabel({
                  className: classNames?.issueLabel,
                })}
              >
                {issueLabel}
              </p>
            </div>
          ) : (
            <div
              data-slot="basket-product-card-footer"
              className={slots.footer({ className: classNames?.footer })}
            >
              <AddToBasketButton
                size="small"
                confirmRemove
                product={listingProduct}
                variant="secondary"
                classNames={{
                  root: 'w-[45%] max-w-26 shrink-0',
                }}
              />

              <PriceTag
                product={listingProduct}
                classNames={{
                  discountRow: 'flex-row-reverse',
                  badge:
                    'flex h-5 -translate-y-px items-center justify-center rounded-full px-2 py-0 text-[12px] leading-[18px] font-medium [&>span]:top-px',
                }}
              />
            </div>
          )}
          {children}
        </div>
      </article>
    </div>
  )
}

export default memo(BasketProductCardComponent)
