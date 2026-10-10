import { tv } from 'tailwind-variants'

export const sliderVariants = tv({
  slots: {
    root: [
      'relative flex w-full touch-none items-center select-none',
      'data-[disabled]:opacity-50',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
    ],
    track: [
      'bg-border-main relative grow overflow-hidden rounded-full',
      'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
    ],
    range: [
      'bg-primary-600 absolute select-none',
      'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
    ],
    thumb: [
      'border-primary-600 ring-primary-600/20 relative block size-5 shrink-0 rounded-full border-2 bg-white shadow-sm',
      'transition-[color,box-shadow] select-none after:absolute after:-inset-2',
      'hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:ring-4',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
  },
})

export type SliderSlots = keyof ReturnType<typeof sliderVariants>

export const sliderSkeletonVariants = tv({
  slots: {
    root: 'bg-muted h-1 w-full rounded-full',
  },
})

export type SliderSkeletonSlots = keyof ReturnType<
  typeof sliderSkeletonVariants
>
