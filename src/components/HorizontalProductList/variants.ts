import { tv } from 'tailwind-variants'

export const horizontalProductListVariants = tv({
  slots: {
    root: 'relative w-full',
    header: 'relative isolate mb-3 flex items-center justify-between gap-2',
    headerBackdrop:
      'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
    title: 'typo-label-medium text-text-primary line-clamp-1',
    headerLead: 'flex min-w-0 shrink-0 items-center gap-2',
    moreLink:
      'text-primary-600 typo-label-small flex shrink-0 items-center gap-1',
    carousel: '-mx-4',
    // Applied to Embla viewport (not the translated track).
    carouselContent: 'px-4',
    item: 'shrink-0 basis-[47%] pl-3',
    productLink: 'w-full',
  },
})

export type HorizontalProductListSlots = keyof ReturnType<
  typeof horizontalProductListVariants
>

export const horizontalProductListSkeletonVariants = tv({
  slots: {
    root: 'relative w-full',
    header: 'mb-3 flex items-center justify-between gap-2',
    title: 'h-5 w-32 rounded-md',
    moreLink: 'h-4 w-20 shrink-0 rounded-md',
    carousel: '-mx-4',
    carouselContent: 'px-4',
    item: 'shrink-0 basis-[47%] pl-3',
  },
})

export type HorizontalProductListSkeletonSlots = keyof ReturnType<
  typeof horizontalProductListSkeletonVariants
>
