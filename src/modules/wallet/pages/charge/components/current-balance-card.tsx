import { type FC } from 'react'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

type CurrentBalanceCardProps = {
  totalBalance: number
  creditAmount: number
  giftAmount: number
}

const CurrentBalanceCard: FC<CurrentBalanceCardProps> = ({
  totalBalance,
  creditAmount,
  giftAmount,
}) => {
  return (
    <div className="rounded-brand border-primary-300 bg-primary-50 relative overflow-hidden border p-4">
      <div className="from-primary-100/60 via-primary-50/30 to-primary-100/50 absolute inset-0 bg-gradient-to-br" />

      <div className="bg-primary-200/40 absolute -top-10 -left-10 size-40 rounded-full blur-2xl" />
      <div className="bg-primary-200/50 absolute -right-10 -bottom-16 size-64 rounded-full blur-3xl" />
      <div className="bg-primary-100/40 absolute top-1/2 -right-20 size-48 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-1">
        <div className="text-text-primary typo-title-small text-center font-medium">
          موجودی فعلی کیف پول:{' '}
          <span className="typo-title-medium font-bold">
            {formatPrice(toTomanPrice(totalBalance))}
          </span>{' '}
          تومان
        </div>
        <div className="text-text-secondary typo-body-small text-center">
          {formatPrice(toTomanPrice(giftAmount))} هدیه +{' '}
          {formatPrice(toTomanPrice(creditAmount))} شارژ کیف پول
        </div>
      </div>
    </div>
  )
}

export default CurrentBalanceCard
