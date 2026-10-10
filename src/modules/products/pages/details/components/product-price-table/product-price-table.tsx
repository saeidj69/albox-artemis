import { TOMAN } from '@/constants'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import type { ListingProduct } from '@/api/models'

import { cn } from '@/lib/utils'

type ProductPriceTableProps = {
  product: ListingProduct
}

const ProductPriceTable = (props: ProductPriceTableProps) => {
  const { product } = props

  const isAvailable = product.purchasableQuantity > 0

  if (!isAvailable) return null

  const hasDiscount = product?.totalDiscount > 0
  const profit = Math.abs(product.unitDiscountedPrice - product.unitRetailPrice)
  const profitNegative = product.unitDiscountedPrice > product.unitRetailPrice
  const cashbackAmount = product.totalCashbackAmount

  const items = [
    {
      label: 'قیمت مصرف‌کننده:',
      value: isAvailable
        ? formatPrice(toTomanPrice(product.unitRetailPrice))
        : '−',
    },
    ...(!hasDiscount
      ? []
      : [
          {
            label: 'قیمت خرید تکی شما:',
            value: isAvailable
              ? formatPrice(toTomanPrice(product.unitDiscountedPrice))
              : '−',
          },
        ]),
    ...(!hasDiscount
      ? []
      : [
          {
            label: 'سود شما از فروش هر عدد:',
            value: isAvailable
              ? `${formatPrice(toTomanPrice(profit))}${profitNegative ? '−' : ''}`
              : '−',
          },
        ]),
    ...(cashbackAmount <= 0
      ? []
      : [
          {
            label: 'بازگشت اعتبار هر کارتن به کیف پول شما:',
            value: isAvailable
              ? formatPrice(toTomanPrice(cashbackAmount))
              : '−',
          },
        ]),
    {
      label: 'قیمت یک کارتن:',
      value: isAvailable
        ? formatPrice(toTomanPrice(product.boxRetailPrice))
        : '−',
    },
    ...(!hasDiscount
      ? []
      : [
          {
            label: 'قیمت خرید کارتن شما:',
            value: isAvailable
              ? formatPrice(toTomanPrice(product.boxDiscountedPrice))
              : '−',
          },
        ]),
  ]

  return (
    <div className="border-border-lighter overflow-hidden rounded-lg border bg-white">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            'border-border-lighter flex items-center justify-between border-b px-4 py-4 last:border-b-0',
            index % 2 === 0 && 'bg-background-secondary',
          )}
        >
          <span className="typo-label-small text-text-secondary">
            {item.label}
          </span>

          <span className="typo-body-medium text-text-primary">
            <span>{item.value} </span>
            <span className="typo-label-x-small text-text-secondary">
              {TOMAN}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProductPriceTable
