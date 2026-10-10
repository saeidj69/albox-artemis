import Image from 'next/image'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import type { BalanceCardProps } from './types'
import { balanceCardVariants } from './variants'

const BALANCE_CARD_RATIO = 350 / 187

const BalanceCardComponent = (props: BalanceCardProps) => {
  const { balance, className, classNames, ref, active, ...rest } = props

  const slots = balanceCardVariants({ active })

  return (
    <AspectRatio
      ref={ref}
      ratio={BALANCE_CARD_RATIO}
      data-slot="balance-card"
      className={cn(slots.root({ className }), classNames?.root)}
      {...rest}
    >
      <Image src="/images/wallet/card.svg" fill alt=" " />

      <div
        data-slot="balance-card-overlay"
        className={slots.overlay({ className: classNames?.overlay })}
      >
        <div
          data-slot="balance-card-amount"
          className={slots.amount({ className: classNames?.amount })}
        >
          {formatPrice(toTomanPrice(balance))}
          <span
            data-slot="balance-card-unit"
            className={slots.unit({ className: classNames?.unit })}
          >
            تومان
          </span>
        </div>
      </div>
    </AspectRatio>
  )
}

export default BalanceCardComponent
