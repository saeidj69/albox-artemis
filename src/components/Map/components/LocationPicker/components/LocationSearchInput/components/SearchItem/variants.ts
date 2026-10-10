import { tv } from 'tailwind-variants'

export const searchItemVariants = tv({
  slots: {
    root: [
      'rounded-brand flex w-full cursor-pointer items-center gap-2 p-3',
      'hover:bg-background-secondary active:bg-background-darker',
    ],
    icon: 'ml-2 size-5 shrink-0',
    content: 'flex min-w-0 flex-1 flex-col items-start gap-0.5',
    title: 'typo-label-medium line-clamp-1 text-right',
    subtitle: 'typo-body-small text-text-secondary text-right',
  },
})

export type SearchItemSlots = keyof ReturnType<typeof searchItemVariants>

export const searchItemSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand flex w-full items-center gap-2 p-3',
    icon: 'ml-2 size-5 shrink-0 rounded-full',
    content: 'flex min-w-0 flex-1 flex-col items-start gap-0.5',
    title: 'h-4 w-3/4 rounded-full',
    subtitle: 'h-3.5 w-1/2 rounded-full',
  },
})

export type SearchItemSkeletonSlots = keyof ReturnType<
  typeof searchItemSkeletonVariants
>
