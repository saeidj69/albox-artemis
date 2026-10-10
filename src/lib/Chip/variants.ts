import { tv } from 'tailwind-variants'

export const chipVariants = tv({
  slots: {
    root: [
      'rounded-full border border-transparent',
      'disabled:cursor-not-allowed',
      'transition-colors duration-200',
      'inline-flex max-w-full min-w-0 items-center justify-center',
    ],
    start: 'inline-flex shrink-0 items-center justify-center',
    content:
      'inline-flex min-w-0 flex-1 items-center justify-center font-medium',
    end: 'inline-flex shrink-0 items-center justify-center',
  },
  variants: {
    variant: {
      default: {
        root: 'border-border-main bg-transparent',
        start: 'text-text-primary',
        content: 'text-text-primary',
        end: 'text-text-primary',
      },
      primary: {
        root: 'border-primary-500/50 bg-primary-500/50',
        start: 'text-white',
        content: 'text-white',
        end: 'text-white',
      },
      secondary: {
        root: 'border-secondary-700 bg-secondary-50',
        start: 'text-text-primary',
        content: 'text-text-primary',
        end: 'text-text-primary',
      },
      /** Borderless, transparent background */
      ghost: {
        root: 'border-transparent bg-transparent',
        start: 'text-text-primary',
        content: 'text-text-primary',
        end: 'text-text-primary',
      },
      /** Borderless, subtle fill */
      soft: {
        root: 'bg-background-secondary border-transparent',
        start: 'text-text-primary',
        content: 'text-text-primary',
        end: 'text-text-primary',
      },
      /** Dark border, transparent background (ink / high-contrast outline) */
      outlineInk: {
        root: 'border-text-primary bg-transparent',
        start: 'text-text-primary',
        content: 'text-text-primary',
        end: 'text-text-primary',
      },
    },
    interactive: {
      true: {},
      false: {},
    },
    disabled: {
      true: {},
      false: {},
    },
    size: {
      small: {
        root: 'h-5 gap-0.5 px-1.5',
        start: '*:data-[slot="icon"]:size-4',
        content: 'typo-label-x-small',
        end: '*:data-[slot="icon"]:size-4',
      },
      medium: {
        root: 'h-6 gap-1 px-2',
        start: '*:data-[slot="icon"]:size-5',
        content: 'typo-label-small',
        end: '*:data-[slot="icon"]:size-5',
      },
      large: {
        root: 'h-8 gap-1.5 px-3',
        start: '*:data-[slot="icon"]:size-6',
        content: 'typo-label-medium',
        end: '*:data-[slot="icon"]:size-6',
      },
    },
  },
  compoundVariants: [
    {
      interactive: true,
      variant: 'default',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-background-darker',
          'active:bg-background-disabled active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      variant: 'primary',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-primary-700',
          'active:bg-primary-800 active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      variant: 'secondary',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-secondary-100',
          'active:bg-secondary-200 active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      variant: 'ghost',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-background-darker',
          'active:bg-background-disabled active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      variant: 'soft',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-background-darker',
          'active:bg-background-disabled active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      variant: 'outlineInk',
      class: {
        root: [
          'cursor-pointer select-none',
          'transition-all duration-200',
          'hover:bg-background-secondary',
          'active:bg-background-darker active:scale-95',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'default',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-background-secondary active:scale-100',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'primary',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-primary-600 active:scale-100',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'secondary',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-secondary-50 active:scale-100',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'ghost',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-transparent active:scale-100',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'soft',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-background-secondary active:scale-100',
        ],
      },
    },
    {
      interactive: true,
      disabled: true,
      variant: 'outlineInk',
      class: {
        root: [
          'cursor-not-allowed opacity-50',
          'hover:bg-transparent active:scale-100',
        ],
      },
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'medium',
    interactive: false,
    disabled: false,
  },
})

export const chipSkeletonVariants = tv({
  slots: {
    root: 'rounded-full',
  },
  variants: {
    size: {
      small: {
        root: 'h-5',
      },
      medium: {
        root: 'h-6',
      },
      large: {
        root: 'h-8',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type ChipSlots = keyof ReturnType<typeof chipVariants>
export type ChipSkeletonSlots = keyof ReturnType<typeof chipSkeletonVariants>
