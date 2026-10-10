import { tv } from 'tailwind-variants'

export const headerVariants = tv({
  slots: {
    root: [
      'grid h-16 w-full grid-cols-6 items-center px-4',
      'bg-background-main',
      'w-app shadow-sm',
    ],
    left: 'flex min-w-0 justify-end',
    right: 'flex min-w-0 justify-start',
    center: 'typo-label-medium col-span-4 min-w-0 text-center',
  },
})
