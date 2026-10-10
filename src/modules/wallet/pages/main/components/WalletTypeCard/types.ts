import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import {
  walletTypeCardSkeletonVariants,
  walletTypeCardVariants,
} from './variants'
import type {
  WalletTypeCardSkeletonSlots,
  WalletTypeCardSlots,
} from './variants'

export type WalletTypeCardProps = {
  index: number
  title: string
  amount: number
  icon: ReactNode
  className?: string
  classNames?: Partial<Record<WalletTypeCardSlots, string>>
} & VariantProps<typeof walletTypeCardVariants> &
  Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>

export type WalletTypeCardSkeletonProps = {
  className?: string
  classNames?: Partial<Record<WalletTypeCardSkeletonSlots, string>>
} & VariantProps<typeof walletTypeCardSkeletonVariants>
