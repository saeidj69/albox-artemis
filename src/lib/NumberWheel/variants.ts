import { tv } from 'tailwind-variants'

export const numberWheelVariants = tv({
  slots: {
    root: 'relative w-full select-none [-webkit-touch-callout:none]',
    track: [
      'relative z-10 flex w-full overflow-x-auto overscroll-x-contain',
      '[-webkit-overflow-scrolling:touch]',
      'snap-x snap-mandatory',
      'cursor-grab data-[dragging=true]:cursor-grabbing',
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      'h-[var(--nw-height)]',
      'pr-[calc(50%-var(--nw-item)/2)] pl-[calc(50%-var(--nw-item)/2)]',
      '[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]',
    ],
    item: [
      'flex shrink-0 snap-center snap-always items-center justify-center',
      'h-[var(--nw-height)] w-[var(--nw-item)]',
      'text-text-tertiary data-[active=true]:text-text-primary',
      'text-2xl data-[active=true]:font-bold',
      'transition-colors duration-150',
    ],
    highlight: [
      'pointer-events-none absolute top-1/2 left-1/2 z-0',
      '-translate-x-1/2 -translate-y-1/2 rounded-xl border',
      'border-primary-600 bg-primary-50',
      'h-[var(--nw-highlight)] w-[var(--nw-highlight)]',
    ],
  },
})

export type NumberWheelSlots = keyof ReturnType<typeof numberWheelVariants>

export const numberWheelSkeletonVariants = tv({
  slots: {
    root: 'w-full rounded-md',
  },
})

export type NumberWheelSkeletonSlots = keyof ReturnType<
  typeof numberWheelSkeletonVariants
>
