import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { BalanceCardSkeletonProps } from './types'
import { balanceCardSkeletonVariants } from './variants'

const BALANCE_CARD_RATIO = 350 / 187

const BalanceCardSkeletonComponent = (props: BalanceCardSkeletonProps) => {
  const { className, classNames, ...otherProps } = props

  const slots = balanceCardSkeletonVariants()

  return (
    <AspectRatio
      ratio={BALANCE_CARD_RATIO}
      data-slot="balance-card-skeleton"
      className={cn(slots.root({ className }), classNames?.root)}
      {...otherProps}
    >
      <Skeleton
        data-slot="balance-card-skeleton-fill"
        className={slots.fill({ className: classNames?.fill })}
      />
    </AspectRatio>
  )
}

export default BalanceCardSkeletonComponent
