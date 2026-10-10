import Animate from '@/components/Animate'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import type { WalletTypeCardProps } from './types'
import { walletTypeCardVariants } from './variants'

const WalletTypeCardComponent = (props: WalletTypeCardProps) => {
  const {
    title,
    amount,
    icon,
    className,
    classNames,
    ref,
    active,
    index,
    ...rest
  } = props

  const slots = walletTypeCardVariants({ active })

  return (
    <div
      ref={ref}
      data-slot="wallet-type-card"
      className={cn(slots.root({ className }), classNames?.root)}
      {...rest}
    >
      <div
        data-slot="wallet-type-card-header"
        className={slots.header({ className: classNames?.header })}
      >
        <span
          data-slot="wallet-type-card-icon"
          className={slots.icon({ className: classNames?.icon })}
        >
          {icon}
        </span>
        <span
          data-slot="wallet-type-card-title"
          className={slots.title({ className: classNames?.title })}
        >
          {title}
        </span>
      </div>

      <Animate
        delay={100 + index * 100}
        animation="slideUp"
        data-slot="wallet-type-card-amount-row"
        className={slots.amountRow({ className: classNames?.amountRow })}
      >
        <span
          data-slot="wallet-type-card-amount"
          className={slots.amount({ className: classNames?.amount })}
        >
          {formatPrice(toTomanPrice(amount))}
        </span>
        <span
          data-slot="wallet-type-card-unit"
          className={slots.unit({ className: classNames?.unit })}
        >
          تومان
        </span>
      </Animate>
    </div>
  )
}

export default WalletTypeCardComponent
