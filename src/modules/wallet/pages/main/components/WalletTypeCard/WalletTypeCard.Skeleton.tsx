import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { WalletTypeCardSkeletonProps } from './types'
import { walletTypeCardSkeletonVariants } from './variants'

const WalletTypeCardSkeletonComponent = (
  props: WalletTypeCardSkeletonProps,
) => {
  const { className, classNames, ...otherProps } = props

  const slots = walletTypeCardSkeletonVariants()

  return (
    <div
      data-slot="wallet-type-card-skeleton"
      className={cn(slots.root({ className }), classNames?.root)}
      {...otherProps}
    >
      <div
        data-slot="wallet-type-card-skeleton-header"
        className={slots.header({ className: classNames?.header })}
      >
        <Skeleton
          data-slot="wallet-type-card-skeleton-icon"
          className={slots.icon({ className: classNames?.icon })}
        />
        <Skeleton
          data-slot="wallet-type-card-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />
      </div>

      <Skeleton
        data-slot="wallet-type-card-skeleton-amount"
        className={slots.amount({ className: classNames?.amount })}
      />
    </div>
  )
}

export default WalletTypeCardSkeletonComponent
