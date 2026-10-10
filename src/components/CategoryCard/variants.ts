import { tv } from 'tailwind-variants'

export const categoryCardVariants = tv({
  slots: {
    root: [
      'relative w-full cursor-pointer',
      'transition-all duration-200 hover:scale-105 active:scale-95',
      'flex flex-col items-center',
    ],
    aspectRatio: 'relative',
    image: 'h-full w-full object-contain',
    title: 'typo-body-small mt-2 whitespace-nowrap',
  },
})

export type CategoryCardSlots = keyof ReturnType<typeof categoryCardVariants>

export const categoryCardSkeletonVariants = tv({
  slots: {
    root: ['relative w-full', 'flex flex-col items-center'],
    aspectRatio: 'relative',
    image: 'absolute inset-0 h-full w-full rounded-lg',
    title: 'mt-3 h-3.5 w-3/4 rounded',
  },
})

export type CategoryCardSkeletonSlots = keyof ReturnType<
  typeof categoryCardSkeletonVariants
>
