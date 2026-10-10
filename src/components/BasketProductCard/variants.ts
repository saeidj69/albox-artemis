import { tv } from 'tailwind-variants'

export const basketProductCardVariants = tv({
  slots: {
    root: 'flex w-full flex-col',
    article: 'flex w-full items-start gap-4',
    imageWrapper:
      'bg-background-main rounded-brand relative size-24 shrink-0 overflow-hidden',
    image: 'object-cover p-2',
    body: 'min-w-0 flex-1 space-y-1.5',
    title: 'typo-body-medium line-clamp-1',
    footer: 'flex flex-wrap items-end justify-between gap-2',
    issue: 'space-y-1',
    issueLabel: 'typo-label-medium text-error-main',
  },
  variants: {
    state: {
      ok: {},
      error: {
        imageWrapper: 'opacity-60',
        title: 'text-text-secondary',
      },
      not_found: {
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
    state: 'ok',
    active: false,
  },
})

export type BasketProductCardSlots = keyof ReturnType<
  typeof basketProductCardVariants
>

export const basketProductCardSkeletonVariants = tv({
  slots: {
    root: 'flex w-full items-center gap-4',
    body: 'w-full space-y-2',
    title: 'h-5 w-3/4 rounded',
    chip: 'h-5 w-24 rounded-full',
    footer: 'flex items-end justify-between gap-3',
    price: 'flex flex-col items-end gap-1',
    strikethrough: 'h-3 w-16 rounded',
    priceValue: 'h-5 w-24 rounded',
    addToCart: 'rounded-brand h-7.5 w-[45%]',
    imageWrapper: 'rounded-brand size-24 shrink-0',
  },
})

export type BasketProductCardSkeletonSlots = keyof ReturnType<
  typeof basketProductCardSkeletonVariants
>
