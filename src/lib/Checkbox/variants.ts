import { tv } from 'tailwind-variants'

export const checkboxVariants = tv({
  slots: {
    root: [
      'group rounded-brand relative inline-flex shrink-0 items-center justify-center border-2 transition-colors duration-100 outline-none',
      'size-6 cursor-pointer',
      // Base (unchecked)
      'border-border-main bg-transparent',
      'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:outline-none',
      // Checked / Indeterminate
      'data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-700',
      'data-[state=indeterminate]:bg-primary-600 data-[state=indeterminate]:border-primary-700',
      // Disabled
      'disabled:cursor-not-allowed',
      'disabled:border-border-disabled',
      'disabled:data-[state=checked]:bg-background-disabled disabled:data-[state=checked]:border-border-disabled',
      'disabled:data-[state=indeterminate]:bg-background-disabled disabled:data-[state=indeterminate]:border-border-disabled',
      // Invalid
      'aria-invalid:border-error-main aria-invalid:ring-error-main/20',
      'active:scale-95',
    ],
    indicator: ['grid place-content-center text-current'],
    icon: [
      'text-background-main group-disabled:text-background-disabled size-4.5',
    ],
    iconCheck: [
      'hidden group-data-[state=checked]:block group-data-[state=indeterminate]:hidden',
    ],
    iconMinus: [
      'hidden group-data-[state=checked]:hidden group-data-[state=indeterminate]:block',
    ],
  },
})

export type CheckboxSlots = keyof ReturnType<typeof checkboxVariants>

export const checkboxSkeletonVariants = tv({
  slots: {
    root: 'size-4.5 rounded-[4px]',
  },
})

export type CheckboxSkeletonSlots = keyof ReturnType<
  typeof checkboxSkeletonVariants
>
