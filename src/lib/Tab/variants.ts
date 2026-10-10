import { tv } from 'tailwind-variants'

export const tabVariants = tv({
  slots: {
    root: 'flex w-full flex-col gap-2',
    list: 'bg-background-secondary rounded-brand relative flex w-full items-center',
    indicator: [
      // left-0: offsetLeft is physical; pairs with translate3d (RTL-safe)
      'rounded-brand pointer-events-none absolute inset-y-0 left-0 bg-white shadow-xs',
      'will-change-[transform,width]',
    ],
    trigger: [
      'text-text-secondary relative z-10 flex flex-1 cursor-pointer items-center justify-center',
      'rounded-brand border border-transparent text-center transition-colors outline-none',
      'focus-visible:ring-border-main focus-visible:ring-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-primary-500',
      'active:scale-95',
    ],
    content: 'focus-visible:outline-none data-[state=inactive]:hidden',
  },
  variants: {
    size: {
      small: {
        list: 'gap-0.5 p-0.5',
        indicator: 'my-0.5',
        trigger: 'typo-label-x-small px-2 py-1',
      },
      medium: {
        list: 'gap-1 p-1',
        indicator: 'my-1',
        trigger: 'typo-body-small px-3 py-2',
      },
      large: {
        list: 'gap-1 p-1.5',
        indicator: 'my-1.5',
        trigger: 'typo-label-medium px-4 py-2.5',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type TabSlots = keyof ReturnType<typeof tabVariants>
