import { CardTick, Cards } from 'iconsax-reactjs'

import type { OrderOrderPaymentMethod } from '@/api/models'

import { cn } from '@/lib/utils'

type PaymentMethodIconProps = {
  method: OrderOrderPaymentMethod
  insufficient?: boolean
  className?: string
}

const METHOD_ICON: Record<
  OrderOrderPaymentMethod,
  typeof CardTick | typeof Cards
> = {
  ipg: CardTick,
  cod: Cards,
  credit: Cards,
}

const PaymentMethodIcon = ({
  method,
  insufficient = false,
  className,
}: PaymentMethodIconProps) => {
  const Icon = METHOD_ICON[method] ?? Cards

  return (
    <div
      data-slot="payment-method-icon"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full p-2',
        insufficient ? 'bg-error-lighter' : 'bg-primary-50',
        className,
      )}
    >
      <Icon
        variant="Outline"
        className={cn(
          'size-5',
          insufficient ? 'text-error-main' : 'text-primary-600',
        )}
      />
    </div>
  )
}

export default PaymentMethodIcon
export type { PaymentMethodIconProps }
