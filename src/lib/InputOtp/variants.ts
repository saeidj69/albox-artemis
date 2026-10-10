import { tv } from 'tailwind-variants'

export const inputOtpVariants = tv({
  slots: {
    root: [
      'flex flex-col gap-1',
      /* Strong LTR + bidi isolation: RTL page + weak digits can reverse flex/cell order on some WebViews. */
      '[direction:ltr] [unicode-bidi:isolate]',
    ],
    container: [
      'relative flex flex-col gap-2',
      '[direction:ltr] [unicode-bidi:isolate]',
    ],
    cells: [
      'pointer-events-auto relative z-10 flex flex-1 flex-row gap-2',
      '[direction:ltr] [unicode-bidi:isolate]',
    ],
    cell: [
      'rounded-brand border-border-darker relative flex h-14 w-10 min-w-0 flex-1 border',
      '[direction:ltr] [unicode-bidi:isolate]',
      'hover:border-primary-950 data-[slot-active=true]:border-primary-950 relative cursor-text duration-100',
    ],
    digit: [
      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      '[unicode-bidi:plaintext]',
    ],
    caret: [
      'animate-blink pointer-events-none absolute top-1/2 left-1/2 block h-5 w-px -translate-1/2 bg-black',
    ],
  },
  variants: {
    error: {
      true: {
        cell: [
          'border-error-main focus-within:border-error-main',
          'hover:border-error-main',
        ],
        caret: 'bg-error-main',
      },
    },
  },
})

export type InputOtpSlots = keyof ReturnType<typeof inputOtpVariants>

export const inputOtpSkeletonVariants = tv({
  slots: {
    root: ['flex flex-col gap-1', '[direction:ltr] [unicode-bidi:isolate]'],
    container: [
      'flex flex-row gap-2',
      '[direction:ltr] [unicode-bidi:isolate]',
    ],
    cell: 'rounded-brand h-14 w-10 flex-1',
  },
})

export type InputOtpSkeletonSlots = keyof ReturnType<
  typeof inputOtpSkeletonVariants
>
