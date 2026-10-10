import { formatPrice, toTomanPrice } from '@/utils/numbers'

import type {
  OrderOrderPaymentMethod,
  PaymentPaymentMethodResponse,
} from '@/api/models'

import RadioGroup from '@/lib/Radio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { buildIpgCashbackPercentMessage } from '../IpgCashbackAlert/build-ipg-cashback-messages'
import IpgCashbackBadge from '../IpgCashbackBadge'
import PaymentMethodIcon from '../PaymentMethodIcon'

const methodTitle: Record<OrderOrderPaymentMethod, string> = {
  ipg: 'پرداخت آنلاین',
  cod: 'پرداخت در محل',
  credit: 'کیف پول',
}

const methodSubtitle: Record<OrderOrderPaymentMethod, string> = {
  ipg: 'درگاه به‌پرداخت',
  cod: 'پرداخت با دستگاه کارتخوان یا اعتبار باروک',
  credit: '',
}

type PaymentMethodOptionProps = {
  method: PaymentPaymentMethodResponse
  selected: OrderOrderPaymentMethod | null
  totalPayable: number
  disabled: boolean
  cashbackPercent?: number
}

type PaymentMethodOptionSkeletonProps = {
  className?: string
}

const PaymentMethodOptionComponent = ({
  method,
  selected,
  totalPayable,
  disabled,
  cashbackPercent,
}: PaymentMethodOptionProps) => {
  const value = method.type.value as OrderOrderPaymentMethod
  const insufficient = method.maxAvailableAmount < totalPayable
  const isDisabled = disabled || insufficient
  const showCashback =
    value === 'ipg' && cashbackPercent != null && cashbackPercent > 0

  return (
    <label
      data-slot="payment-method-option"
      className={cn(
        'rounded-brand relative flex items-center gap-3 border p-3 transition-colors',
        'active:bg-background-secondary duration-100',
        insufficient
          ? 'border-error-main bg-error-lighter/30'
          : selected === value
            ? 'border-primary-600'
            : 'border-border-main',
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      {showCashback && <IpgCashbackBadge />}
      <PaymentMethodIcon method={value} insufficient={insufficient} />

      <div className="flex min-w-0 flex-1 flex-col gap-2 text-right">
        {showCashback ? (
          <span
            className={cn(
              'typo-body-small font-medium',
              isDisabled ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {methodTitle.ipg}{' '}
            <span
              className={cn(
                'typo-body-small font-normal',
                isDisabled ? 'text-text-tertiary' : 'text-text-secondary',
              )}
            >
              (درگاه به پرداخت)
            </span>
          </span>
        ) : (
          <span
            className={cn(
              'typo-body-small font-medium',
              isDisabled ? 'text-text-tertiary' : 'text-text-primary',
            )}
          >
            {methodTitle[value] ?? method.type.label}
          </span>
        )}

        {showCashback && cashbackPercent != null ? (
          <span className="typo-body-small text-text-secondary leading-5">
            {buildIpgCashbackPercentMessage(cashbackPercent)}
          </span>
        ) : (
          methodSubtitle[value] && (
            <span className="typo-body-small text-text-secondary leading-5">
              {methodSubtitle[value]}
            </span>
          )
        )}

        {insufficient && (
          <span className="typo-body-small text-error-main mt-1 leading-5">
            مبلغ قابل پرداخت ({formatPrice(toTomanPrice(totalPayable))} تومان)
            بیشتر از حد مجاز این روش (
            {formatPrice(toTomanPrice(method.maxAvailableAmount))} تومان) است
          </span>
        )}
      </div>

      <RadioGroup.Item
        value={value}
        disabled={isDisabled}
        classNames={{
          item: 'data-[state=checked]:border-primary-600',
          icon: 'bg-primary-600',
        }}
      />
    </label>
  )
}

const PaymentMethodOptionSkeletonComponent = ({
  className,
}: PaymentMethodOptionSkeletonProps) => (
  <Skeleton
    data-slot="payment-method-option-skeleton"
    className={cn('h-[72px] w-full rounded-xl', className)}
  />
)

const PaymentMethodOption = Object.assign(PaymentMethodOptionComponent, {
  Skeleton: PaymentMethodOptionSkeletonComponent,
})

export default PaymentMethodOption
export type { PaymentMethodOptionProps, PaymentMethodOptionSkeletonProps }
