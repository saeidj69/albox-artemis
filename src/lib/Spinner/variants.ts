import { tv } from 'tailwind-variants'

export const spinnerVariants = tv({
  slots: {
    root: ['animate-spin'],
  },
  variants: {
    size: {
      large: { root: 'size-6' },
      medium: { root: 'size-5' },
      small: { root: 'size-4' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type SpinnerSlots = keyof ReturnType<typeof spinnerVariants>
