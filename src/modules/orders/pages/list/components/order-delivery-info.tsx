import { formatJalaliLongDate, formatJalaliTimeslot } from '@/utils/date'

import { cn } from '@/lib/utils'

type OrderDeliveryInfoProps = {
  startsAt: string
  endsAt: string
  className?: string
}

const OrderDeliveryInfo = ({
  startsAt,
  endsAt,
  className,
}: OrderDeliveryInfoProps) => {
  const date = formatJalaliLongDate(startsAt)
  const timeslot = formatJalaliTimeslot(startsAt, endsAt)

  return (
    <div
      className={cn(
        'typo-body-small text-text-secondary flex flex-wrap items-center gap-1',
        className,
      )}
    >
      <span>زمان تحویل مرسوله:</span>
      <span className="text-text-primary">
        {date} / {timeslot}
      </span>
    </div>
  )
}

export default OrderDeliveryInfo
