import { tv } from 'tailwind-variants'

export const cashbackBadgeVariants = tv({
  slots: {
    root: [
      'bg-primary-100 text-primary-600 inline-flex items-center overflow-hidden pt-[5px] pb-[3px] whitespace-nowrap',
      'transition-[padding,gap] duration-350 ease-out motion-reduce:transition-none',
    ],
    percent: 'shrink-0 translate-y-[0.5px] whitespace-nowrap',
    label: [
      'translate-y-[0.5px] overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-350 ease-out motion-reduce:transition-none',
    ],
    icon: 'text-primary-600 shrink-0 -translate-y-px',
  },
  variants: {
    // `tab` sticks to the edge of a product image, `pill` sits inline in a row.
    shape: {
      tab: {
        root: 'typo-label-medium rounded-r-lg',
        icon: 'size-3.5',
      },
      pill: {
        root: 'typo-label-small rounded-full',
        icon: 'size-4',
      },
    },
    collapsed: {
      true: {
        root: 'gap-0.5 px-1',
        label: 'max-w-0 opacity-0',
      },
      false: {
        root: 'gap-1 px-1.5',
        label: 'max-w-24 opacity-100',
      },
    },
  },
  compoundVariants: [
    {
      shape: 'pill',
      collapsed: false,
      class: { root: 'px-2' },
    },
  ],
  defaultVariants: {
    shape: 'tab',
    collapsed: false,
  },
})

export type CashbackBadgeSlots = keyof ReturnType<typeof cashbackBadgeVariants>
