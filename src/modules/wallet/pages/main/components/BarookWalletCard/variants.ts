import { tv } from 'tailwind-variants'

export const barookWalletCardVariants = tv({
  slots: {
    root: 'rounded-brand border-primary-100 flex flex-col gap-2 border p-4',
    row: 'flex items-center justify-between',
    start: 'flex items-center gap-2',
    icon: 'shrink-0',
    title: 'text-text-secondary typo-body-medium',
    balance: 'text-text-primary typo-title-small',
    unit: 'typo-body-x-small text-text-secondary mr-1',
    usableStart: '',
    usableLabel: 'text-text-primary typo-body-small',
    usableHint: 'typo-body-x-small text-text-secondary',
    usableAmount: 'text-success-main typo-title-x-small',
  },
  variants: {
    active: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type BarookWalletCardSlots = keyof ReturnType<
  typeof barookWalletCardVariants
>

export const barookWalletCardSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand border-primary-100 flex flex-col gap-2 border p-4',
    topRow: 'mb-3 flex items-center justify-between',
    bottomRow: 'flex items-center justify-between',
    start: 'flex items-center gap-2',
    icon: 'rounded-brand size-5',
    title: 'rounded-brand h-5 w-24',
    balance: 'rounded-brand h-5 w-16',
    usableStart: 'flex items-center gap-1',
    usableLabel: 'rounded-brand h-4 w-28',
    usableAmount: 'rounded-brand h-4 w-14',
  },
})

export type BarookWalletCardSkeletonSlots = keyof ReturnType<
  typeof barookWalletCardSkeletonVariants
>
