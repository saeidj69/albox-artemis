import { tv } from 'tailwind-variants'

export const textAreaVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    content: [
      'rounded-brand border-border-darker flex border p-4 py-3.5',
      'focus-within:border-primary-950 hover:border-primary-950',
      'hover:cursor-text',
      'duration-100',
    ],
    input: [
      'placeholder:text-text-secondary flex-1 bg-transparent outline-none',
      'selection:bg-secondary-100 selection:text-secondary-950',
      'caret-secondary-500',
    ],
    start: 'ml-2',
    end: 'mr-2',
    label: '',
    labelText: 'typo-label-medium text-text-secondary',
    labelOptionalText: 'typo-body-small text-text-secondary mr-1',
    helperText: 'typo-body-small text-text-secondary',
    helperTextIcon: 'text-text-secondary size-4',
    length: 'typo-body-small text-text-secondary',
  },
  variants: {
    disabled: {
      true: {
        labelText: 'text-text-disabled',
        labelOptionalText: 'text-text-disabled',
        input: 'hover:cursor-not-allowed',
        content: ['hover:border-border-main bg-background-secondary'],
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
      },
    },
  },
  defaultVariants: {
    disabled: false,
    error: false,
  },
})

export type TextAreaSlots = keyof ReturnType<typeof textAreaVariants>

export const textAreaSkeletonVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'h-4 w-24 rounded',
    field: 'rounded-brand h-24 w-full',
  },
})

export type TextAreaSkeletonSlots = keyof ReturnType<
  typeof textAreaSkeletonVariants
>
