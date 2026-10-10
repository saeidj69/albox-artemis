import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { balanceCardSkeletonVariants, balanceCardVariants } from './variants'
import type { BalanceCardSkeletonSlots, BalanceCardSlots } from './variants'

export type BalanceCardProps = {
  balance: number
  className?: string
  classNames?: Partial<Record<BalanceCardSlots, string>>
} & VariantProps<typeof balanceCardVariants> &
  Omit<ComponentPropsWithRef<'div'>, 'children'>

export type BalanceCardSkeletonProps = {
  className?: string
  classNames?: Partial<Record<BalanceCardSkeletonSlots, string>>
} & VariantProps<typeof balanceCardSkeletonVariants>
