import { tv } from 'tailwind-variants'

export const brandCardVariants = tv({
  slots: {
    root: [
      'relative w-full cursor-pointer',
      'transition-all duration-200 hover:scale-105 active:scale-95',
      'border-border-main rounded-brand border',
      'flex flex-col items-center p-2',
    ],
    imageContainer: 'w-2/3',
    aspectRatio: 'rounded-brand relative overflow-hidden',
    image: 'h-full w-full object-contain',
    title: 'typo-body-small mt-1 whitespace-nowrap',
  },
})

export type BrandCardSlots = keyof ReturnType<typeof brandCardVariants>

export const brandCardSkeletonVariants = tv({
  slots: {
    root: [
      'relative w-full cursor-pointer',
      'transition-all duration-200 hover:scale-105 active:scale-95',
      'border-border-main rounded-brand border',
      'flex flex-col items-center p-2',
    ],
    imageContainer: 'w-2/3',
    aspectRatio: 'rounded-brand relative overflow-hidden',
    image: 'h-full w-full object-contain',
    title: 'mt-2 h-3.5 w-3/4 rounded',
  },
})

export type BrandCardSkeletonSlots = keyof ReturnType<
  typeof brandCardSkeletonVariants
>
