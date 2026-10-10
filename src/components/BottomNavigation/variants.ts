import { tv } from 'tailwind-variants'

export const bottomNavigationVariants = tv({
  slots: {
    root: ['bg-background-main relative flex h-16 w-full'],
    indicator: [
      'bg-secondary-500 absolute top-0 right-0 h-0.5 w-1/5 rounded-full',
      'animate-fade-in duration-500',
    ],
    item: [
      'flex w-full flex-col items-center justify-center gap-1',
      'text-text-primary duration-100 active:scale-90',
      'animate-slide-up',
    ],
    active: ['text-primary-500'],
    icon: ['size-6'],
    iconWrapper: ['relative'],
    label: ['typo-label-small text-text-secondary'],
    activeLabel: ['text-primary-800'],
    badge: [
      'absolute -top-1 -right-1',
      'bg-secondary-600 text-white',
      'flex items-center justify-center',
      'h-4 min-w-4 rounded-full px-0.5',
      'typo-label-x-small leading-none',
    ],
  },
})

export type BottomNavigationSlots = keyof ReturnType<
  typeof bottomNavigationVariants
>
