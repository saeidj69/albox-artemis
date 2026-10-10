import type { OrderCustomerOrderStatus } from '@/api/models'

import Chip from '@/lib/Chip'
import { cn } from '@/lib/utils'

import { getOrderStatusChipClassNames } from '../../../utils/status'

type OrderStatusChipProps = {
  status: OrderCustomerOrderStatus
  className?: string
}

const OrderStatusChip = ({ status, className }: OrderStatusChipProps) => {
  const tone = getOrderStatusChipClassNames(status.value)

  return (
    <Chip
      as="div"
      size="small"
      variant="soft"
      content={status.label}
      classNames={{
        root: cn(tone.root, className),
        content: cn('typo-label-x-small', tone.content),
      }}
    />
  )
}

export default OrderStatusChip
