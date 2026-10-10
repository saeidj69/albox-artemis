import { persianDigits } from '@/utils/numbers'

import { cn } from '@/lib/utils/cn'

type OrderDeliveryCodeSlot = 'root' | 'label' | 'value'

type OrderDeliveryCodeProps = {
  code: string
  label?: string
  className?: string
  classNames?: Partial<Record<OrderDeliveryCodeSlot, string>>
}

const OrderDeliveryCode = (props: OrderDeliveryCodeProps) => {
  const { code, label = 'کد تحویل مرسوله:', className, classNames } = props

  return (
    <div
      data-slot="order-delivery-code"
      className={cn(
        'bg-success-lighter border-success-main rounded-brand mb-4 flex items-center justify-between gap-2 border px-4 py-3',
        className,
        classNames?.root,
      )}
    >
      <span
        data-slot="order-delivery-code-label"
        className={cn('typo-body-small text-text-secondary', classNames?.label)}
      >
        {label}
      </span>
      <span
        data-slot="order-delivery-code-value"
        className={cn('typo-label-medium text-text-primary', classNames?.value)}
      >
        {persianDigits(code)}
      </span>
    </div>
  )
}

export default OrderDeliveryCode
