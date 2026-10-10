import { tv } from 'tailwind-variants'

export const skeletonVariants = tv({
  base: 'fade-in animate-in',
  slots: {
    root: 'animate-pulse bg-gray-200',
  },
})

export type SkeletonSlots = keyof ReturnType<typeof skeletonVariants>
