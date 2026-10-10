import { cn } from '@/lib/utils/cn'

export type OrderPriceSummaryRow = {
  label: string
  /** Pre-formatted display value (e.g. «۸٬۷۳۰٬۵۰۰», «رایگان»). */
  value: string
  /** Optional unit shown next to the value (e.g. «تومان», «باکس»). */
  unit?: string
  /** Emphasized grand-total row (larger label + value). */
  emphasized?: boolean
}

type OrderPriceSummaryProps = {
  items: OrderPriceSummaryRow[]
}

const OrderPriceSummary = (props: OrderPriceSummaryProps) => {
  const { items } = props

  return (
    <div data-slot="order-price-summary" className="flex flex-col gap-2">
      {items?.map((item, index) => (
        <div
          key={index}
          data-slot="order-price-row"
          data-emphasized={item.emphasized || undefined}
          className={cn(
            'flex items-center justify-between gap-2',
            item.emphasized && 'mt-2',
          )}
        >
          <span
            data-slot="order-price-label"
            className={
              item.emphasized
                ? 'typo-body-medium text-text-primary'
                : 'typo-body-small text-text-secondary'
            }
          >
            {item.label}
          </span>

          <span
            data-slot="order-price-value"
            className="flex items-center gap-1"
          >
            <span
              className={cn(
                'text-text-primary',
                item.emphasized
                  ? 'typo-title-medium'
                  : item.unit
                    ? 'typo-body-medium'
                    : 'typo-label-small',
              )}
            >
              {item.value}
            </span>

            {item.unit && (
              <span className="typo-body-x-small text-text-secondary">
                {item.unit}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

export default OrderPriceSummary
