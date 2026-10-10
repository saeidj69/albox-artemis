import { tv } from 'tailwind-variants'

export const addressItemVariants = tv({
  slots: {
    root: 'rounded-brand w-full p-4 text-right',
    row: 'flex w-full items-start gap-3',
    startIcon: 'mt-2 shrink-0',
    content: 'min-w-0 flex-1',
    title: 'typo-title-small text-text-primary block truncate',
    address: 'typo-body-small text-text-secondary mt-1 truncate',
    endIcon: 'mt-2 shrink-0',
    postalCode: 'typo-body-small text-text-secondary mt-4',
    postalCodeLabel: 'typo-body-small text-text-primary mt-1 truncate',
  },
  variants: {
    variant: {
      normal: { root: '' },
      outlined: { root: 'border-border-main border' },
    },
    interactive: {
      true: {
        root: 'hover:bg-background-secondary active:bg-background-darker cursor-pointer transition-colors',
      },
      false: {},
    },
    selected: {
      true: { root: 'border-primary-500' },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'normal',
    interactive: false,
    selected: false,
  },
})

export type AddressItemSlots = keyof ReturnType<typeof addressItemVariants>

export const addressItemSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand w-full p-4',
    row: 'flex w-full items-start gap-3',
    startIcon: 'mt-2 size-5 shrink-0 rounded-full',
    content: 'min-w-0 flex-1',
    title: 'rounded-brand h-6 w-1/2',
    address: 'rounded-brand mt-1 h-4 w-full',
    endIcon: 'rounded-brand mt-2 size-5 shrink-0',
    postalCode: 'rounded-brand mt-5 h-4 w-2/3',
  },
  variants: {
    variant: {
      normal: { root: '' },
      outlined: { root: 'border-border-main border' },
    },
  },
  defaultVariants: {
    variant: 'normal',
  },
})

export type AddressItemSkeletonSlots = keyof ReturnType<
  typeof addressItemSkeletonVariants
>
