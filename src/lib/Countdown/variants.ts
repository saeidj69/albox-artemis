import { tv } from 'tailwind-variants'

export const countdownVariants = tv({
  slots: {
    root: 'flex items-center justify-center',
    segment: [
      'bg-background-main border-primary-100 text-text-primary',
      'flex h-full items-center justify-center rounded-lg border whitespace-nowrap',
    ],
    // Colour is inherited so callers can match the band they sit on.
    separator: 'shrink-0 text-center',
  },
  variants: {
    size: {
      small: {
        root: 'h-6 gap-px',
        segment: 'typo-label-x-small min-w-5 px-0.5',
        separator: 'typo-body-x-small w-1',
      },
      medium: {
        root: 'h-7 gap-0.5',
        segment: 'typo-label-small min-w-6 px-1',
        separator: 'typo-body-small w-1.5',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export const countdownSkeletonVariants = tv({
  slots: {
    root: 'flex items-center justify-center',
    segment: 'h-full rounded-lg',
  },
  variants: {
    size: {
      small: {
        root: 'h-6 gap-px',
        segment: 'w-5',
      },
      medium: {
        root: 'h-7 gap-0.5',
        segment: 'w-6',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type CountdownSlots = keyof ReturnType<typeof countdownVariants>
export type CountdownSkeletonSlots = keyof ReturnType<
  typeof countdownSkeletonVariants
>
