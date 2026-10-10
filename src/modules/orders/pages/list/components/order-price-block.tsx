import { TOMAN } from '@/constants'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

type OrderPriceBlockProps = {
  netTotal: number
  grossTotal: number
  className?: string
}

const OrderPriceBlock = ({
  netTotal,
  grossTotal,
  className,
}: OrderPriceBlockProps) => {
  const hasDiscount = grossTotal > netTotal
  const discountPercent = hasDiscount
    ? Math.ceil(((grossTotal - netTotal) / grossTotal) * 100)
    : 0

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {hasDiscount ? (
        <div className="flex items-center gap-2">
          <span className="typo-body-x-small text-text-secondary line-through">
            {formatPrice(toTomanPrice(grossTotal))}
          </span>
          <span className="bg-error-main typo-label-x-small shrink-0 rounded px-1.5 py-0.5 font-bold text-white">
            ٪{persianDigits(discountPercent)}
          </span>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-baseline gap-1">
        <span className="typo-title-small text-text-primary font-medium">
          {formatPrice(toTomanPrice(netTotal))}
        </span>
        <span className="typo-label-x-small text-text-secondary">{TOMAN}</span>
      </div>
    </div>
  )
}

export default OrderPriceBlock
