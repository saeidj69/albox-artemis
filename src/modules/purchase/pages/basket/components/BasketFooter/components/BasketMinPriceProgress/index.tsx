import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

type BasketMinPriceProgressProps = {
  /** Rule threshold (`minBasketPrice`). */
  min: number
  /** Current basket total (`totalPrice`). */
  total: number
  className?: string
}

/**
 * Remaining-amount label + progress bar toward the min-basket-price rule.
 */
const BasketMinPriceProgress = ({
  min,
  total,
  className,
}: BasketMinPriceProgressProps) => {
  if (min <= 0) return null

  const ratio = Math.min(1, Math.max(0, total / min))
  const percent = Math.round(ratio * 100)
  const remaining = Math.max(0, min - total)
  const remainingToman = formatPrice(toTomanPrice(remaining))

  return (
    <div
      data-slot="basket-min-price-progress"
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        <span className="typo-body-small text-text-primary min-w-0 flex-1 truncate">
          مبلغ باقی مانده تا حداقل خرید
        </span>
        <span className="typo-body-medium text-error-main inline-flex items-baseline gap-1 whitespace-nowrap">
          <span>{remainingToman}</span>
          <span>تومان</span>
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={min}
        aria-valuenow={Math.min(total, min)}
        aria-valuetext={`${percent}٪`}
        className="bg-background-secondary relative h-1 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn(
            'bg-primary-500 h-full rounded-full transition-[width] duration-500 ease-out',
            ratio >= 1 && 'bg-success-main',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default BasketMinPriceProgress
