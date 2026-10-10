import { ReactNode } from 'react'

import { RiInformationLine } from '@remixicon/react'

import { cn } from '@/lib/utils/cn'

type OrderCanceledInfoSlot = 'root' | 'icon' | 'text'

type OrderCanceledInfoProps = {
  children?: ReactNode
  className?: string
  classNames?: Partial<Record<OrderCanceledInfoSlot, string>>
}

const OrderCanceledInfo = (props: OrderCanceledInfoProps) => {
  const { children, className, classNames } = props

  return (
    <div
      data-slot="order-canceled-info"
      className={cn(
        'bg-info-lighter border-info-main rounded-brand flex items-center gap-2 border px-4 py-2.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04),0_4px_6px_-4px_rgba(0,0,0,0.04)]',
        className,
        classNames?.root,
      )}
    >
      <RiInformationLine
        data-slot="order-canceled-info-icon"
        className={cn('text-info-main size-5 shrink-0', classNames?.icon)}
      />
      <p
        data-slot="order-canceled-info-text"
        className={cn('typo-body-small text-text-secondary', classNames?.text)}
      >
        {children ?? 'مبلغ این سفارش به کیف پول آل‌باکس شما بازگشت داده شد.'}
      </p>
    </div>
  )
}

export default OrderCanceledInfo
