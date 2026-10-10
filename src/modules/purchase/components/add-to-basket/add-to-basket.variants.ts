import { tv } from 'tailwind-variants'

export const addToBasketVariants = tv({
  slots: {
    root: [
      'flex w-full cursor-pointer items-center rounded-[10px] transition-all duration-200',
      '-webkit-touch-callout:none touch-manipulation select-none',
    ],
    label: 'w-full text-center',
    icon: '',
    previewLabel:
      'shrink-0 overflow-hidden transition-[max-width,opacity] duration-200 ease-out',
  },
  variants: {
    variant: {
      primary: {
        root: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-700',
        label: 'text-white',
        icon: 'text-white',
      },
      secondary: {
        root: [
          'border-primary-500 border',
          'hover:bg-primary-50 active:bg-primary-100',
        ],
        label: 'text-primary-600',
        icon: 'text-primary-600',
      },
      icon: {
        root: [
          'border-primary-400 bg-primary-50 w-10 border',
          'hover:bg-primary-50 active:bg-primary-50',
          'min-w-10 shrink-0 overflow-hidden',
          'transition-all duration-200 ease-out',
          'active:bg-primary-100',
        ],
        label:
          'typo-label-small text-primary-600 shrink-0 px-2 whitespace-nowrap',
        icon: 'text-primary-600 duration-200 active:scale-95',
      },
    },
    size: {
      default: {
        root: 'h-10',
        label: 'typo-body-medium',
        icon: 'h-6',
      },
      small: {
        root: 'h-8',
        label: 'typo-label-small',
        icon: 'h-5',
      },
    },
    disabled: {
      true: {
        root: 'bg-background-secondary hover:bg-background-secondary active:bg-background-secondary cursor-not-allowed',
        label: 'text-text-secondary',
        icon: 'text-text-secondary',
      },
      false: {},
    },
    expanded: {
      true: {},
      false: {},
    },
    previewLabelVisible: {
      true: {
        previewLabel: 'max-w-32 opacity-100',
        label: '',
      },
      false: {
        previewLabel: 'max-w-0 opacity-0',
      },
    },
  },
  compoundVariants: [
    {
      expanded: true,
      previewLabelVisible: false,
      class: { root: 'w-26' },
    },
    {
      expanded: true,
      previewLabelVisible: true,
      class: { root: 'w-32' },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'default',
    disabled: false,
    expanded: false,
    previewLabelVisible: false,
  },
})

export type AddToBasketSlots = keyof ReturnType<typeof addToBasketVariants>

export const addToBasketSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand w-full animate-pulse bg-gray-200',
  },
  variants: {
    size: {
      default: { root: 'h-10' },
      small: { root: 'h-[30px]' },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type AddToBasketSkeletonSlots = keyof ReturnType<
  typeof addToBasketSkeletonVariants
>
