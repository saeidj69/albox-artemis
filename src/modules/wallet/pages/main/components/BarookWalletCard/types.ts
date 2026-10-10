import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import {
  barookWalletCardSkeletonVariants,
  barookWalletCardVariants,
} from './variants'
import type {
  BarookWalletCardSkeletonSlots,
  BarookWalletCardSlots,
} from './variants'

export type BarookWalletCardProps = {
  amount: number
  spendableAmount: number
  className?: string
  classNames?: Partial<Record<BarookWalletCardSlots, string>>
} & VariantProps<typeof barookWalletCardVariants> &
  Omit<ComponentPropsWithRef<'div'>, 'children'>

export type BarookWalletCardSkeletonProps = {
  className?: string
  classNames?: Partial<Record<BarookWalletCardSkeletonSlots, string>>
} & VariantProps<typeof barookWalletCardSkeletonVariants>
