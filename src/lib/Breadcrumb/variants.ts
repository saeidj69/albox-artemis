import { tv } from 'tailwind-variants'

export const breadcrumbVariants = tv({
  slots: {
    root: '',
    list: 'text-text-secondary typo-body-small flex flex-wrap items-center gap-1.5 break-words',
    item: 'inline-flex items-center gap-1.5',
    link: 'text-text-secondary hover:text-text-primary transition-colors',
    page: 'text-text-primary font-normal',
    separator: 'text-text-secondary inline-flex items-center [&>svg]:size-3.5',
    ellipsis: 'text-text-secondary flex size-9 items-center justify-center',
    ellipsisIcon: 'size-4',
    ellipsisLabel: 'sr-only',
  },
})

export type BreadcrumbSlots = keyof ReturnType<typeof breadcrumbVariants>

export const breadcrumbSkeletonVariants = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-1.5',
    segment: 'h-4 w-14 rounded',
    separator: 'size-3.5 shrink-0 rounded',
  },
})

export type BreadcrumbSkeletonSlots = keyof ReturnType<
  typeof breadcrumbSkeletonVariants
>
