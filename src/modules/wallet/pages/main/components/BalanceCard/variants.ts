import { tv } from 'tailwind-variants'

export const balanceCardVariants = tv({
  slots: {
    root: 'rounded-brand overflow-hidden',
    overlay: 'relative z-10 flex size-full items-center justify-center',
    amount: 'text-primary-700 typo-title-x-large font-bold',
    unit: 'typo-title-small mr-2 font-medium',
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

export type BalanceCardSlots = keyof ReturnType<typeof balanceCardVariants>

export const balanceCardSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand overflow-hidden',
    fill: 'rounded-brand size-full',
  },
})

export type BalanceCardSkeletonSlots = keyof ReturnType<
  typeof balanceCardSkeletonVariants
>
