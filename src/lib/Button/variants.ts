import { tv } from 'tailwind-variants'

export const buttonVariants = tv({
  slots: {
    root: [
      'inline-flex items-center justify-center gap-1',
      'rounded-brand cursor-pointer',
      'transition-all duration-200',
      'select-none active:scale-95',
    ],
    startIcon: '-mr-1 size-full shrink-0 text-inherit *:size-full',
    endIcon: '-ml-1 size-full shrink-0 text-inherit *:size-full',
    content: 'flex items-center justify-center text-inherit',
    spinner: '',
  },
  variants: {
    variant: {
      primary: {
        root: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'focus-visible:ring-primary-600',
          'active:bg-primary-800',
        ],
      },
      secondary: {
        root: [
          'border-secondary-100 text-secondary-900',
          'hover:bg-secondary-100 bg-secondary-50',
          'focus-visible:ring-primary-600',
          'active:bg-secondary-200',
        ],
      },
      destructive: {
        root: [
          'bg-error-main text-white',
          'hover:bg-error-dark',
          'focus-visible:ring-error-main',
          'active:bg-error-dark',
        ],
      },
      'destructive-soft': {
        root: [
          'bg-error-lighter text-error-main',
          'hover:bg-error-lighter',
          'focus-visible:ring-error-main',
          'active:bg-error-lighter',
        ],
      },
      text: {
        root: [
          'text-primary-600',
          'hover:bg-primary-50',
          'active:bg-primary-100',
        ],
      },
      ghost: {
        root: [
          'text-secondary-900 border-secondary-900 border bg-transparent',
          'active:bg-secondary-100',
        ],
      },
      error: {
        root: [
          'bg-error-main text-white',
          'hover:bg-error-dark',
          'focus-visible:ring-error-main',
          'active:bg-error-dark',
        ],
      },
      'error-light': {
        root: [
          'bg-error-lighter text-error-dark',
          'hover:bg-error-light',
          'focus-visible:ring-error-main',
          'active:bg-error-light',
        ],
      },
      warning: {
        root: [
          'bg-warning-main text-white',
          'hover:bg-warning-dark',
          'focus-visible:ring-warning-main',
          'active:bg-warning-dark',
        ],
      },
      'warning-light': {
        root: [
          'bg-warning-lighter text-warning-dark',
          'hover:bg-warning-light',
          'focus-visible:ring-warning-main',
          'active:bg-warning-light',
        ],
      },
      info: {
        root: [
          'bg-info-main text-white',
          'hover:bg-info-dark',
          'focus-visible:ring-info-main',
          'active:bg-info-dark',
        ],
      },
      'info-light': {
        root: [
          'bg-info-lighter text-info-dark',
          'hover:bg-info-light',
          'focus-visible:ring-info-main',
          'active:bg-info-light',
        ],
      },
      success: {
        root: [
          'bg-success-main text-white',
          'hover:bg-success-dark',
          'focus-visible:ring-success-main',
          'active:bg-success-dark',
        ],
      },
      'success-light': {
        root: [
          'bg-success-lighter text-success-dark',
          'hover:bg-success-light',
          'focus-visible:ring-success-main',
          'active:bg-success-light',
        ],
      },
    },
    size: {
      large: {
        root: ['h-12 px-6 py-3', 'typo-title-x-small'],
        startIcon: 'size-6',
        endIcon: 'size-6',
        content: 'typo-title-x-small',
      },
      medium: {
        root: ['h-10 px-5 py-2.5', 'typo-title-x-small'],
        startIcon: 'size-5',
        endIcon: 'size-5',
        content: 'typo-title-x-small',
      },
      small: {
        root: ['h-8 px-4 py-2', 'typo-label-small'],
        startIcon: 'size-4',
        endIcon: 'size-4',
        content: 'typo-label-small',
      },
    },
    loading: {
      true: {
        root: 'pointer-events-none relative',
        startIcon: 'opacity-0',
        endIcon: 'opacity-0',
        content: 'opacity-0',
        spinner: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      },
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
      variant: 'text',
      class: {
        root: 'cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'destructive',
      class: {
        root: 'hover:bg-error-main cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'destructive-soft',
      class: {
        root: 'hover:bg-error-lighter cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'ghost',
      class: {
        root: 'cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'error',
      class: {
        root: 'hover:bg-error-main cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'error-light',
      class: {
        root: 'hover:bg-error-lighter cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'warning',
      class: {
        root: 'hover:bg-warning-main cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'warning-light',
      class: {
        root: 'hover:bg-warning-lighter cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'info',
      class: {
        root: 'hover:bg-info-main cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'info-light',
      class: {
        root: 'hover:bg-info-lighter cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'success',
      class: {
        root: 'hover:bg-success-main cursor-not-allowed opacity-50 active:scale-100',
      },
    },
    {
      disabled: true,
      variant: 'success-light',
      class: {
        root: 'hover:bg-success-lighter cursor-not-allowed opacity-50 active:scale-100',
      },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    shape: 'fill',
    loading: false,
    disabled: false,
  },
})

export type ButtonSlots = keyof ReturnType<typeof buttonVariants>

export const buttonSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand',
    startIcon: '',
    content: '',
    endIcon: '',
    spinner: '',
  },
  variants: {
    size: {
      large: { root: 'h-12' },
      medium: { root: 'h-10' },
      small: { root: 'h-8' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type ButtonSkeletonSlots = keyof ReturnType<
  typeof buttonSkeletonVariants
>
