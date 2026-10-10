import { tv } from 'tailwind-variants'

export const walletTypeCardVariants = tv({
  slots: {
    root: [
      'rounded-brand border-primary-100 flex flex-col items-center justify-center gap-2 border p-4',
      'active:bg-background-secondary duration-100',
    ],
    header: 'flex items-center gap-2',
    icon: 'shrink-0',
    title: 'text-text-secondary typo-body-medium',
    amountRow: '',
    amount: 'text-text-primary typo-title-small',
    unit: 'typo-body-x-small text-text-secondary mr-1',
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

export type WalletTypeCardSlots = keyof ReturnType<
  typeof walletTypeCardVariants
>

export const walletTypeCardSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand border-primary-100 flex flex-col items-center justify-center gap-2 border p-4',
    header: 'flex items-center gap-2',
    icon: 'rounded-brand size-5',
    title: 'rounded-brand h-4 w-20',
    amount: 'rounded-brand mt-2.25 h-4 w-24',
  },
})

export type WalletTypeCardSkeletonSlots = keyof ReturnType<
  typeof walletTypeCardSkeletonVariants
>
