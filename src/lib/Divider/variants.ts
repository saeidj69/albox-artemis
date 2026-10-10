import { tv } from 'tailwind-variants'

export const dividerVariants = tv({
  base: 'shrink-0',
  variants: {
    orientation: {
      horizontal: 'bg-border-lighter w-full',
      vertical: 'bg-border-lighter w-px',
    },
    size: {
      small: '',
      large: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'small',
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'small',
      class: 'h-px',
    },
    {
      orientation: 'horizontal',
      size: 'large',
      class: 'h-1',
    },
    {
      orientation: 'vertical',
      size: 'small',
      class: 'h-4',
    },
    {
      orientation: 'vertical',
      size: 'large',
      class: 'h-6',
    },
  ],
})

export type DividerSlots = keyof ReturnType<typeof dividerVariants>
