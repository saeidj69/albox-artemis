import Link from 'next/link'

import { ROUTES } from '@/constants'

import { composeIsoDateTime } from '@/utils/date'
import { persianDigits } from '@/utils/numbers'

import type { OrderCustomerOrder } from '@/api/models'

import Button from '@/lib/Button'
import { cn } from '@/lib/utils'

import OrderDeliveryInfo from './order-delivery-info'
import OrderPriceBlock from './order-price-block'
import OrderStatusChip from './order-status-chip'

type OrderCardProps = {
  order: OrderCustomerOrder
  className?: string
}

const OrderCard = ({ order, className }: OrderCardProps) => {
  return (
    <article
      data-slot="order-card"
      className={cn(
        'bg-background-main border-border-main rounded-brand grid gap-3 border p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="typo-body-small text-text-secondary flex items-center gap-1">
          <span>شماره مرسوله:</span>
          <span className="text-text-primary typo-label-small">
            {persianDigits(order.id)}
          </span>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      <OrderDeliveryInfo
        startsAt={composeIsoDateTime(
          order.deliveryDate,
          order.deliveryStartTime,
        )}
        endsAt={composeIsoDateTime(order.deliveryDate, order.deliveryEndTime)}
      />

      <OrderPriceBlock
        netTotal={order.netTotal}
        grossTotal={order.grossTotal}
      />

      <Button
        as={Link}
        prefetch={false}
        href={ROUTES.ORDERS.detail(order.id)}
        variant="ghost"
        size="medium"
        className="w-full"
      >
        مشاهده جزئیات
      </Button>
    </article>
  )
}

export default OrderCard
