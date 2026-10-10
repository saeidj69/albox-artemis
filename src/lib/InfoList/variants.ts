import { tv } from 'tailwind-variants'

export const infoListVariants = tv({
  slots: {
    root: 'border-border-lighter overflow-hidden rounded-lg border',
    row: 'border-border-lighter flex items-center justify-between border-b px-4 py-3 last:border-b-0',
    rowAlt: 'bg-background-secondary',
    label: 'typo-body-small text-text-secondary',
    value: 'typo-label-small text-text-primary',
    labelEmphasized: 'typo-label-small text-text-primary',
    valueEmphasized: 'typo-title-small text-text-primary font-medium',
  },
  variants: {
    variant: {
      default: {},
      plain: {
        root: 'rounded-none border-0',
        row: 'border-b-0 px-0 py-2',
        rowAlt: 'bg-transparent',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const infoListSkeletonVariants = tv({
  slots: {
    root: 'border-border-lighter overflow-hidden rounded-lg border',
    row: 'border-border-lighter flex items-center justify-between border-b px-4 py-3 last:border-b-0',
    rowAlt: 'bg-background-secondary',
    label: 'h-4 w-24',
    value: 'h-4 w-20',
  },
  variants: {
    variant: {
      default: {},
      plain: {
        root: 'rounded-none border-0',
        row: 'border-b-0 px-0 py-2',
        rowAlt: 'bg-transparent',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type InfoListSlots = keyof ReturnType<typeof infoListVariants>
export type InfoListSkeletonSlots = keyof ReturnType<
  typeof infoListSkeletonVariants
>
