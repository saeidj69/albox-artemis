'use client'

import CashbackBadge from '@/components/CashbackBadge'
import SmartImage from '@/components/SmartImage'

import { selectCashbackPercent } from '@/utils/cashback'

import type { ListingProduct } from '@/api/models'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

type ProductImageSectionProps = {
  product: ListingProduct
}

const ProductImageSection = (props: ProductImageSectionProps) => {
  const { product } = props

  const isAvailable = product.purchasableQuantity > 0

  const productBadge = (() => {
    if (!isAvailable) {
      return 'اتمام موجودی'
    }

    if (product.totalDiscount > 0) {
      return `٪${Math.ceil(product.totalDiscount)}`
    }
  })()

  const cashbackPercent = selectCashbackPercent(
    isAvailable,
    product.totalCashback,
  )

  return (
    <div className="-mx-4">
      <AspectRatio ratio={4 / 3}>
        <SmartImage
          fill
          loading="eager"
          sizes="100vw"
          alt={product?.name}
          media={product?.images?.[0]}
          preferredSize="xl"
          classNames={{
            image: cn('object-contain p-4', !isAvailable && 'grayscale'),
          }}
        />

        {(productBadge || cashbackPercent != null) && (
          <div
            data-slot="product-image-badges"
            dir="ltr"
            className="absolute top-14 left-0 z-10 flex flex-col items-start gap-1"
          >
            {productBadge && (
              <div
                className={cn(
                  'bg-error-main typo-label-small rounded-brand px-2 pt-[5px] pb-[3px] text-white',
                  'rounded-l-none',
                )}
              >
                <span className="relative top-[0.5px]">{productBadge}</span>
              </div>
            )}

            {cashbackPercent != null && (
              <CashbackBadge percent={cashbackPercent} alwaysExpanded />
            )}
          </div>
        )}
      </AspectRatio>
    </div>
  )
}

export default ProductImageSection
