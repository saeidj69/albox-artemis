import { tv } from 'tailwind-variants'

export const switchVariants = tv({
  slots: {
    root: [
      'group inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all duration-200',
      'data-[state=checked]:bg-primary-600 hover:data-[state=checked]:bg-primary-700',
      'data-[state=unchecked]:bg-background-disabled hover:data-[state=unchecked]:bg-black/20',
      'disabled:data-[state=checked]:bg-background-disabled disabled:data-[state=unchecked]:bg-background-disabled',
      'disabled:cursor-not-allowed',
      'focus-visible:ring-primary-600 duration-200 focus-visible:ring-2 focus-visible:outline-none',
      'active:scale-95',
      'hover:bg-primary-500',
    ],
    thumb: [
      'bg-background-main pointer-events-none block rounded-full',
      'transition-all duration-200 will-change-transform group-hover:scale-110',
    ],
  },
  variants: {
    size: {
      medium: {
        root: 'h-8 w-14 p-1',
        thumb: [
          'size-6',
          'data-[state=checked]:-translate-x-6 data-[state=unchecked]:translate-x-0',
        ],
      },
      small: {
        root: 'h-6 w-10 p-0.5',
        thumb: [
          'size-5',
          'data-[state=checked]:-translate-x-4 data-[state=unchecked]:translate-x-0',
        ],
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type SwitchSlots = keyof ReturnType<typeof switchVariants>

export const switchSkeletonVariants = tv({
  slots: {
    root: 'rounded-full',
  },
  variants: {
    size: {
      medium: {
        root: 'h-8 w-14',
      },
      small: {
        root: 'h-6 w-10',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type SwitchSkeletonSlots = keyof ReturnType<
  typeof switchSkeletonVariants
>
