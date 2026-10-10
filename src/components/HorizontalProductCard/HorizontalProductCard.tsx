'use client'

import { FC, memo, useMemo } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'
import { Box } from 'iconsax-reactjs'

import PriceTag from '@/components/PriceTag'
import SmartImage from '@/components/SmartImage'

import { AddToBasketButton } from '@/modules/purchase/components/add-to-basket'

import { persianDigits } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import { HorizontalProductCardProps } from './types'
import { horizontalProductCardVariants } from './variants'

const HorizontalProductCardComponent: FC<HorizontalProductCardProps> = (
  props,
) => {
  const {
    product,
    confirmRemove,
    state = 'available',
    className,
    classNames,
    ref,
    ...rest
  } = props

  const slots = horizontalProductCardVariants({ state })
  const isUnavailable = state !== 'available'
  const issueLabel = state === 'not_purchasable' ? 'غیر قابل خرید' : 'ناموجود'

  const productLink = useMemo(() => ROUTES.product(product.id), [product.id])

  const trackProductView = () =>
    track(EVENTS.PRODUCT_VIEWED, { plausible: true })
  return (
    <div
      ref={ref}
      data-slot="horizontal-product-card"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <article
        data-slot="horizontal-product-card-article"
        className={slots.article({ className: classNames?.article })}
      >
        <Link
          href={productLink}
          data-slot="horizontal-product-card-image"
          className={slots.imageWrapper({
            className: classNames?.imageWrapper,
          })}
          prefetch={false}
          onClick={trackProductView}
        >
          <SmartImage
            alt={product?.name ?? ''}
            media={product?.images?.[0]}
            preferredSize="md"
            fill
            sizes="80px"
            classNames={{
              image: slots.image({ className: classNames?.image }),
            }}
          />
        </Link>

        <div
          data-slot="horizontal-product-card-body"
          className={slots.body({ className: classNames?.body })}
        >
          <Link
            href={productLink}
            data-slot="horizontal-product-card-title"
            className={slots.title({
              className: cn('block', classNames?.title),
            })}
            onClick={trackProductView}
          >
            {product?.name}
          </Link>

          <div className="text-primary-500 flex shrink-0 items-center gap-0.5">
            <Box className="size-3 shrink-0" />
            <span className="typo-label-x-small">
              کارتن {persianDigits(product.unitInBox)} عددی
            </span>
          </div>

          {isUnavailable ? (
            <div
              data-slot="horizontal-product-card-issue"
              className={slots.issue({ className: classNames?.issue })}
            >
              <p
                data-slot="horizontal-product-card-issue-label"
                className={slots.issueLabel({
                  className: classNames?.issueLabel,
                })}
              >
                {issueLabel}
              </p>
            </div>
          ) : (
            <div
              data-slot="horizontal-product-card-footer"
              className={slots.footer({ className: classNames?.footer })}
            >
              <AddToBasketButton
                size="small"
                variant="secondary"
                product={product}
                confirmRemove={confirmRemove}
                classNames={{
                  root: 'w-[45%] max-w-26 shrink-0',
                }}
              />

              <PriceTag product={product} />
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default memo(HorizontalProductCardComponent)
