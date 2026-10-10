import { tv } from 'tailwind-variants'

export const radioGroupVariants = tv({
  slots: {
    root: ['grid gap-3'],
    item: [
      'group relative aspect-square size-4.5 shrink-0 rounded-full border-2 transition-colors outline-none',
      'cursor-pointer disabled:cursor-not-allowed',
      // Base / unchecked
      'border-border-darker bg-transparent',
      // Hover / focus
      'enabled:hover:border-border-darker',
      'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      // Checked
      'data-[state=checked]:border-primary-500',
      // Disabled
      'disabled:border-border-darker',
      // Invalid
      'aria-invalid:border-error-main aria-invalid:ring-error-main/20',
    ],
    indicator: ['absolute inset-0 flex items-center justify-center'],
    icon: [
      'bg-primary-500 size-2.5 rounded-full',
      'group-disabled:bg-border-darker',
    ],
  },
})

export type RadioGroupSlots = keyof ReturnType<typeof radioGroupVariants>

export const radioGroupSkeletonVariants = tv({
  slots: {
    root: 'grid gap-3',
    item: 'size-4.5 rounded-full',
  },
})

export type RadioGroupSkeletonSlots = keyof ReturnType<
  typeof radioGroupSkeletonVariants
>
