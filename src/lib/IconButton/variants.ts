import { tv } from 'tailwind-variants'

export const iconButtonVariants = tv({
  slots: {
    root: [
      'inline-flex items-center justify-center',
      'rounded-brand cursor-pointer',
      'transition-all duration-200',
      'select-none active:scale-95',
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
    ],
    icon: 'flex shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    variant: {
      primary: {
        root: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'focus-visible:ring-primary-600',
        ],
        icon: 'text-white',
      },
      secondary: {
        root: [
          'border-secondary-200 text-secondary-900 bg-secondary-50 border',
          'hover:bg-secondary-100',
          'focus-visible:ring-primary-600',
        ],
        icon: 'text-secondary-900',
      },
      ghost: {
        root: [
          'text-text-primary bg-transparent',
          'hover:bg-primary-50',
          'active:bg-primary-100',
          'focus-visible:ring-primary-600',
        ],
        icon: 'text-text-primary',
      },
    },
    size: {
      large: { root: 'size-10', icon: 'size-6' },
      medium: { root: 'size-8', icon: 'size-5' },
      small: { root: 'size-6', icon: 'size-4' },
    },
    disabled: {
      true: {},
    },
  },
  compoundVariants: [
    {
      disabled: true,
      variant: 'primary',
      class: {
        root: 'hover:bg-primary-600 cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'secondary',
      class: {
        root: 'hover:bg-secondary-50 cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'ghost',
      class: { root: 'cursor-not-allowed opacity-50 active:scale-100' },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
  },
})

export type IconButtonSlots = keyof ReturnType<typeof iconButtonVariants>

export const iconButtonSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand',
  },
  variants: {
    size: {
      large: { root: 'size-10' },
      medium: { root: 'size-8' },
      small: { root: 'size-6' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type IconButtonSkeletonSlots = keyof ReturnType<
  typeof iconButtonSkeletonVariants
>
