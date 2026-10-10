import { tv } from 'tailwind-variants'

export const flipDigitsVariants = tv({
  slots: {
    root: 'relative inline-flex flex-row-reverse items-center justify-center overflow-hidden',
    digit:
      'relative block w-fit transition-transform duration-500 not-first:-ml-[0.075em]',
    digitItem: 'block content-center text-center',
  },
  variants: {
    size: {
      small: {
        root: 'h-[1em]',
        digit: 'h-[1em]',
        digitItem: 'h-[1em]',
      },
      medium: {
        root: 'h-[1.5em]',
        digit: 'h-[1.5em]',
        digitItem: 'h-[1.5em]',
      },
      large: {
        root: 'h-[2em]',
        digit: 'h-[2em]',
        digitItem: 'h-[2em]',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type FlipDigitsSlots = keyof ReturnType<typeof flipDigitsVariants>

export const flipDigitsSkeletonVariants = tv({
  slots: {
    root: 'inline-flex items-center gap-0.5',
    digit: 'h-[1.5em] w-[0.6em] rounded',
  },
})

export type FlipDigitsSkeletonSlots = keyof ReturnType<
  typeof flipDigitsSkeletonVariants
>
