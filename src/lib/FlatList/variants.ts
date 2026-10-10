import { tv } from 'tailwind-variants'

export const flatListVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row overflow-x-auto overflow-y-hidden',
    },
  },
  defaultVariants: {
    direction: 'vertical',
  },
})

export type FlatListSlots = keyof ReturnType<typeof flatListVariants>
