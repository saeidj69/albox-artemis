import { tv } from 'tailwind-variants'

export const priceTagVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    discountRow: 'flex items-center gap-2',
    badge:
      'bg-error-main typo-label-x-small shrink-0 rounded px-1.5 pt-[3px] pb-px font-bold text-white',
    strikethrough: 'typo-body-medium text-text-secondary line-through',
    priceRow: 'flex items-baseline gap-1',
    price: 'typo-title-medium text-text-primary font-medium',
    currency: 'typo-label-x-small text-text-secondary font-normal',
  },
  variants: {
    active: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type PriceTagSlots = keyof ReturnType<typeof priceTagVariants>
