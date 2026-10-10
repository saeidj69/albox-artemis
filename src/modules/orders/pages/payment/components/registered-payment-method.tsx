import type { ReactNode } from 'react'

import { TOMAN } from '@/constants'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

type RegisteredPaymentMethodProps = {
  title: string
  amountRial: number
  icon: ReactNode
  feeRial?: number
}

const RegisteredPaymentMethod = (props: RegisteredPaymentMethodProps) => {
  const { title, amountRial, icon, feeRial } = props

  return (
    <div
      data-slot="registered-payment-method"
      className="rounded-brand border-border-main bg-background-main flex items-center gap-3 border p-3"
    >
      <div className="bg-primary-50 flex size-10 shrink-0 items-center justify-center rounded-full">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="typo-body-medium text-text-primary">{title}</p>

        {feeRial != null && feeRial > 0 && (
          <p className="typo-body-small text-text-secondary mt-0.5">
            هزینه خدمات اعتباری آل‌باکس: {formatPrice(feeRial)} ریال
          </p>
        )}
      </div>

      <p className="typo-body-medium text-text-primary shrink-0 text-left">
        <span>{formatPrice(toTomanPrice(amountRial))}</span>
        <span> {TOMAN}</span>
      </p>
    </div>
  )
}

export default RegisteredPaymentMethod
