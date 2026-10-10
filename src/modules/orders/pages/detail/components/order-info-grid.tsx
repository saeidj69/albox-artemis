import { formatJalaliLongDate } from '@/utils/date'
import { persianDigits } from '@/utils/numbers'

import { cn } from '@/lib/utils/cn'

type OrderInfoGridProps = {
  orderId: number
  createdAt: string
  paymentLabel: string
  paymentValue: string
}

type OrderInfoRowProps = {
  label: string
  value: string
  valueClassName?: string
}

const OrderInfoRow = (props: OrderInfoRowProps) => {
  const { label, value, valueClassName } = props

  return (
    <div
      data-slot="order-info-row"
      className="flex items-center justify-between gap-2"
    >
      <span
        data-slot="order-info-label"
        className="typo-body-small text-text-secondary"
      >
        {label}
      </span>
      <span
        data-slot="order-info-value"
        className={cn(
          'text-text-primary',
          valueClassName ?? 'typo-label-small',
        )}
      >
        {value}
      </span>
    </div>
  )
}

const OrderInfoGrid = (props: OrderInfoGridProps) => {
  const { orderId, createdAt, paymentLabel, paymentValue } = props

  return (
    <div data-slot="order-info-grid" className="flex flex-col gap-2">
      <OrderInfoRow
        label="شماره سفارش:"
        value={persianDigits(orderId)}
        valueClassName="typo-body-medium"
      />
      <OrderInfoRow
        label="تاریخ ثبت سفارش:"
        value={formatJalaliLongDate(createdAt)}
      />
      <OrderInfoRow label={paymentLabel} value={paymentValue} />
    </div>
  )
}

export default OrderInfoGrid
