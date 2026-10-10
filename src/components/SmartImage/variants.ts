import { tv } from 'tailwind-variants'

export const productImageWithFallbackVariants = tv({
  slots: {
    root: 'relative size-full',
    placeholder:
      'pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60 transition-opacity duration-300',
    picture: 'contents',
    image: 'opacity-0 transition-opacity duration-300',
  },
})

export const slots = productImageWithFallbackVariants()

export type ProductImageWithFallbackSlots = keyof ReturnType<
  typeof productImageWithFallbackVariants
>
