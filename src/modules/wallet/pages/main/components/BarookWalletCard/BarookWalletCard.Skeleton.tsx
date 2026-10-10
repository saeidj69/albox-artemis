import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { BarookWalletCardSkeletonProps } from './types'
import { barookWalletCardSkeletonVariants } from './variants'

const BarookWalletCardSkeletonComponent = (
  props: BarookWalletCardSkeletonProps,
) => {
  const { className, classNames, ...otherProps } = props

  const slots = barookWalletCardSkeletonVariants()

  return (
    <div
      data-slot="barook-wallet-card-skeleton"
      className={cn(slots.root({ className }), classNames?.root)}
      {...otherProps}
    >
      <div
        data-slot="barook-wallet-card-skeleton-row"
        className={slots.topRow({ className: classNames?.topRow })}
      >
        <div
          data-slot="barook-wallet-card-skeleton-start"
          className={slots.start({ className: classNames?.start })}
        >
          <Skeleton
            data-slot="barook-wallet-card-skeleton-icon"
            className={slots.icon({ className: classNames?.icon })}
          />
          <Skeleton
            data-slot="barook-wallet-card-skeleton-title"
            className={slots.title({ className: classNames?.title })}
          />
        </div>

        <Skeleton
          data-slot="barook-wallet-card-skeleton-balance"
          className={slots.balance({ className: classNames?.balance })}
        />
      </div>

      <div
        data-slot="barook-wallet-card-skeleton-usable-row"
        className={slots.bottomRow({ className: classNames?.bottomRow })}
      >
        <div
          data-slot="barook-wallet-card-skeleton-usable-start"
          className={slots.usableStart({ className: classNames?.usableStart })}
        >
          <Skeleton
            data-slot="barook-wallet-card-skeleton-usable-label"
            className={slots.usableLabel({
              className: classNames?.usableLabel,
            })}
          />
        </div>

        <Skeleton
          data-slot="barook-wallet-card-skeleton-usable-amount"
          className={slots.usableAmount({
            className: classNames?.usableAmount,
          })}
        />
      </div>
    </div>
  )
}

export default BarookWalletCardSkeletonComponent
