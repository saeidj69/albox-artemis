import { tv } from 'tailwind-variants'

export const horizontalProductCardVariants = tv({
  slots: {
    root: 'flex w-full items-center gap-4',
    article: 'flex w-full items-center gap-4',
    imageWrapper:
      'bg-background-main rounded-brand relative size-24 shrink-0 overflow-hidden',
    image: 'object-cover p-2',
    body: 'w-full space-y-2',
    title: 'typo-body-medium line-clamp-1',
    footer: 'flex items-end justify-between',
    issue: 'space-y-1',
    issueLabel: 'typo-label-small text-error-main',
    issueDescription: 'typo-body-x-small text-error-main/80',
  },
  variants: {
    state: {
      available: {},
      unavailable: {
        imageWrapper: 'opacity-60',
        title: 'text-text-secondary',
      },
      not_purchasable: {
        imageWrapper: 'opacity-60',
        title: 'text-text-secondary',
      },
    },
    active: {
      true: {
        root: 'ring-primary-500/35 ring-offset-background-main ring-2 ring-offset-2',
      },
      false: {},
    },
  },
  defaultVariants: {
    state: 'available',
    active: false,
  },
})

export type HorizontalProductCardSlots = keyof ReturnType<
  typeof horizontalProductCardVariants
>

export const horizontalProductCardSkeletonVariants = tv({
  slots: {
    root: 'flex w-full items-center gap-4',
    body: 'w-full space-y-2',
    title: 'h-5 w-3/4 rounded',
    chip: 'h-5 w-24 rounded-full',
    footer: 'flex items-end justify-between gap-3',
    price: 'flex flex-col items-end gap-1',
    strikethrough: 'h-3 w-16 rounded',
    priceValue: 'h-5 w-24 rounded',
    addToCart: 'rounded-brand h-[30px] w-[45%]',
    imageWrapper: 'rounded-brand size-24 shrink-0',
  },
})

export type HorizontalProductCardSkeletonSlots = keyof ReturnType<
  typeof horizontalProductCardSkeletonVariants
>
