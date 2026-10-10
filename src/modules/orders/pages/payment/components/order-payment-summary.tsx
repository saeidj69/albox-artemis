import { TOMAN } from '@/constants'

import { formatJalaliLongDateTime } from '@/utils/date'
import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import Chip from '@/lib/Chip'
import { cn } from '@/lib/utils'

type OrderPaymentSummaryProps = {
  orderId: number
  createdAt: string
  remainingRial: number
  totalRial: number
  fulfilled?: boolean
  customerName?: string
  paidLabel?: string
}

const OrderPaymentSummary = (props: OrderPaymentSummaryProps) => {
  const {
    orderId,
    createdAt,
    remainingRial,
    totalRial,
    fulfilled = false,
    customerName,
    paidLabel = 'پرداخت شده',
  } = props

  const paidRial = fulfilled
    ? totalRial
    : Math.max(0, totalRial - remainingRial)
  const ratio = fulfilled
    ? 1
    : totalRial > 0
      ? Math.min(1, paidRial / totalRial)
      : 0
  const percent = Math.round(ratio * 100)

  return (
    <section
      data-slot="order-payment-summary"
      className="rounded-brand border-border-main bg-background-main border p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="typo-body-medium text-text-primary">
          <span>سفارش: </span>
          <span>{persianDigits(orderId)}</span>
        </p>

        {fulfilled && (
          <Chip
            as="div"
            size="small"
            variant="soft"
            content={paidLabel}
            classNames={{
              root: 'bg-success-main border-transparent',
              content: 'typo-label-x-small text-text-inverse',
            }}
          />
        )}
      </div>

      {fulfilled && customerName ? (
        <p className="typo-body-small text-text-secondary mt-1">
          {customerName}
        </p>
      ) : (
        <p className="typo-body-small text-text-secondary mt-1">
          {formatJalaliLongDateTime(createdAt)}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {fulfilled && (
          <p className="typo-body-small text-text-secondary">تکمیل شده</p>
        )}

        <p
          className={cn(
            'typo-title-x-small',
            fulfilled ? 'text-text-secondary' : 'text-primary-600',
          )}
        >
          <span>باقی‌مانده: </span>
          {fulfilled ? (
            <span>0 {TOMAN}</span>
          ) : (
            <>
              <span>{formatPrice(toTomanPrice(remainingRial))}</span>
              <span> {TOMAN}</span>
            </>
          )}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalRial}
        aria-valuenow={paidRial}
        aria-valuetext={`${percent}٪`}
        className="bg-primary-100 mt-3 h-1.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary-600 h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  )
}

export default OrderPaymentSummary
