import Link from 'next/link'

import { ROUTES, TOMAN } from '@/constants'
import { Box } from 'iconsax-reactjs'

import SmartImage from '@/components/SmartImage'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import type { OrderOrderProduct } from '@/api/models'

import Chip from '@/lib/Chip'
import { cn } from '@/lib/utils/cn'

type OrderProductCardProps = {
  product: OrderOrderProduct
  isInactive?: boolean
}

const OrderProductCard = (props: OrderProductCardProps) => {
  const { product, isInactive = false } = props

  const hasDiscount = product.discountAmount > 0
  const image = product.images[0]

  return (
    <Link
      prefetch={false}
      href={ROUTES.product(product.productId)}
      data-slot="order-product-card"
      data-inactive={isInactive || undefined}
      className={cn('flex gap-1', isInactive && 'opacity-50 grayscale')}
    >
      {image && (
        <div className="bg-background-secondary rounded-brand relative flex size-20 shrink-0 items-center justify-center overflow-hidden">
          <SmartImage
            fill
            media={image}
            preferredSize="sm"
            alt={product.name}
            sizes="80px"
            classNames={{ image: 'object-contain' }}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="typo-label-small text-text-primary line-clamp-2">
          {product.name}
        </span>

        <div className="flex items-center gap-2">
          <div className="text-primary-500 flex shrink-0 items-center gap-0.5">
            <Box className="size-3 shrink-0" />
            <span className="typo-label-x-small">
              کارتن {persianDigits(product?.unitInBox)} عددی
            </span>
          </div>

          <Chip
            as="div"
            size="small"
            variant="secondary"
            content={`${persianDigits(product.quantity)} کارتن`}
          />
        </div>

        <div className="grid gap-1">
          <div className="flex justify-between gap-1">
            <p className="typo-body-x-small text-text-secondary">
              قیمت تک کارتن:
            </p>
            <p className="flex items-baseline gap-2">
              {hasDiscount && (
                <span className="typo-body-x-small text-text-secondary line-through">
                  {formatPrice(toTomanPrice(product.retailPrice))}
                </span>
              )}
              <span className="typo-label-small text-text-primary">
                {formatPrice(toTomanPrice(product.netPrice))}
              </span>
              <span className="typo-body-x-small text-text-secondary">
                {TOMAN}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-1">
          <p className="typo-body-x-small text-text-secondary">مجموع قیمت:</p>
          <p className="flex gap-2">
            <span className="typo-label-small text-text-primary">
              {formatPrice(toTomanPrice(product.totalNetPrice))}
            </span>
            <span className="typo-body-x-small text-text-secondary">
              {TOMAN}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default OrderProductCard
