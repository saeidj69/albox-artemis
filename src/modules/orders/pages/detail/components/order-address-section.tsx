import { Location, Clock } from 'iconsax-reactjs'

import { formatJalaliHourRange, formatJalaliLongDate } from '@/utils/date'

type OrderAddressSectionProps = {
  address: string
  shipmentStartsAt: string
  shipmentEndsAt: string
}

const OrderAddressSection = (props: OrderAddressSectionProps) => {
  const { address, shipmentStartsAt, shipmentEndsAt } = props

  const date = formatJalaliLongDate(shipmentStartsAt)
  const hourRange = formatJalaliHourRange(shipmentStartsAt, shipmentEndsAt)

  return (
    <div data-slot="order-address-section" className="grid gap-1.5">
      <div className="flex items-center gap-1">
        <Location className="text-text-primary size-4 shrink-0" />
        <p className="typo-body-small text-text-secondary min-w-0 flex-1 truncate">
          {address}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Clock className="text-text-primary size-4 shrink-0" />
        <span className="typo-label-small text-text-primary">
          {date} - ساعت {hourRange}
        </span>
      </div>
    </div>
  )
}

export default OrderAddressSection
