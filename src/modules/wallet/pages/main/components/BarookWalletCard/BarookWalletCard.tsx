import Image from 'next/image'

import { InfoCircle } from 'iconsax-reactjs'

import Animate from '@/components/Animate'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import type { BarookWalletCardProps } from './types'
import { barookWalletCardVariants } from './variants'

const BarookWalletCardComponent = (props: BarookWalletCardProps) => {
  const {
    amount,
    spendableAmount,
    className,
    classNames,
    ref,
    active,
    ...rest
  } = props

  const slots = barookWalletCardVariants({ active })

  return (
    <div
      ref={ref}
      data-slot="barook-wallet-card"
      className={cn(slots.root({ className }), classNames?.root)}
      {...rest}
    >
      <div
        data-slot="barook-wallet-card-row"
        className={slots.row({ className: classNames?.row })}
      >
        <div
          data-slot="barook-wallet-card-start"
          className={slots.start({ className: classNames?.start })}
        >
          <Image
            src="/images/barook.svg"
            alt="barook"
            width={20}
            height={20}
            className={slots.icon({ className: classNames?.icon })}
          />
          <div
            data-slot="barook-wallet-card-title"
            className={slots.title({ className: classNames?.title })}
          >
            کیف پول باروک
          </div>
        </div>

        <Animate animation="slideRight">
          <span
            data-slot="barook-wallet-card-balance"
            className={slots.balance({ className: classNames?.balance })}
          >
            {formatPrice(toTomanPrice(amount))}
          </span>
          <span
            data-slot="barook-wallet-card-unit"
            className={slots.unit({ className: classNames?.unit })}
          >
            تومان
          </span>
        </Animate>
      </div>

      <div
        data-slot="barook-wallet-card-usable-row"
        className={slots.row({ className: classNames?.row })}
      >
        <div
          data-slot="barook-wallet-card-usable-start"
          className={slots.usableStart({ className: classNames?.usableStart })}
        >
          <span
            data-slot="barook-wallet-card-usable-label"
            className={slots.usableLabel({
              className: classNames?.usableLabel,
            })}
          >
            مبلغ قابل استفاده
          </span>
        </div>

        <Animate animation="slideRight" delay={100}>
          <span
            data-slot="barook-wallet-card-usable-amount"
            className={slots.usableAmount({
              className: classNames?.usableAmount,
            })}
          >
            {formatPrice(toTomanPrice(spendableAmount))}
          </span>
          <span
            data-slot="barook-wallet-card-usable-unit"
            className={slots.unit({ className: classNames?.unit })}
          >
            تومان
          </span>
        </Animate>
      </div>

      <div className="flex items-center gap-1">
        <InfoCircle size={16} className="text-gray-500" />
        <span
          data-slot="barook-wallet-card-usable-hint"
          className={slots.usableHint({ className: classNames?.usableHint })}
        >
          این مبلغ بدون در نظر گرفتن خدمات اعتباری آل‌باکس می‌باشد.
        </span>
      </div>
    </div>
  )
}

export default BarookWalletCardComponent
