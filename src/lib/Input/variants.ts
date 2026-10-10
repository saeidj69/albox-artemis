import { tv } from 'tailwind-variants'

export const inputVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: '',
    labelText: 'typo-label-medium text-text-secondary',
    labelOptionalText: 'typo-body-small text-text-secondary mr-1',
    content: [
      'rounded-brand border-border-darker flex border p-4 py-3.5',
      'focus-within:border-primary-950 hover:border-primary-950',
      'hover:cursor-text',
      'duration-100',
    ],
    input: [
      'placeholder:text-text-secondary min-w-0 flex-1 bg-transparent outline-none',
      'selection:bg-secondary-100 selection:text-secondary-950',
      'caret-secondary-500',
    ],
    start: 'ml-2',
    end: 'mr-2',
    helperText: 'typo-body-small text-text-secondary',
    helperTextIcon: 'text-text-secondary size-4',
    length: 'typo-body-small text-text-secondary',
    helperArea: 'flex items-center justify-between gap-1',
    helperTextWrapper: 'flex items-center gap-1',
  },
  variants: {
    disabled: {
      true: {
        labelText: 'text-text-disabled',
        labelOptionalText: 'text-text-disabled',
        // opacity/fill overrides stop iOS Safari from dimming the value text
        input: [
          'hover:cursor-not-allowed',
          'opacity-100 [-webkit-text-fill-color:var(--color-text-primary)]',
        ],
        content: ['hover:border-border-main bg-background-secondary'],
        start: 'text-text-disabled',
        end: 'text-text-disabled',
      },
    },
    error: {
      true: {
        content: [
          'border-error-main focus-within:border-error-main',
          'hover:border-error-main',
        ],
        input: [
          'caret-text-error',
          'selection:bg-error-light selection:text-error-main',
        ],
        helperText: 'text-text-error',
        helperTextIcon: 'text-text-error',
        length: 'text-text-error',
        start: 'text-error-main',
        end: 'text-error-main',
      },
    },
  },
  defaultVariants: {
    disabled: false,
    error: false,
  },
})

export type InputSlots = keyof ReturnType<typeof inputVariants>

export const inputSkeletonVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'h-4 w-24 rounded',
    field: 'rounded-brand h-12 w-full',
  },
})

export type InputSkeletonSlots = keyof ReturnType<typeof inputSkeletonVariants>
