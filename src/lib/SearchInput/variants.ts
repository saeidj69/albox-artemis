import { tv } from 'tailwind-variants'

export const searchInputVariants = tv({
  slots: {
    root: 'flex w-full flex-col gap-1',
    field: 'relative',
    content: [
      'bg-background-darker rounded-brand flex h-10 items-center gap-2 px-4',
      'focus-within:ring-primary-600 caret-secondary-500 duration-100 focus-within:ring-1',
      'typo-body-small',
    ],
    icon: 'text-text-secondary size-5 shrink-0',
    input: [
      'placeholder:text-text-secondary selection:bg-secondary-100 selection:text-secondary-950',
      'min-w-0 flex-1 bg-transparent outline-none',
    ],
    clearButton:
      'focus-visible:ring-primary-950/30 cursor-pointer rounded p-0.5 outline-none focus-visible:ring-2',
    clearIcon: 'text-text-secondary size-5',
    placeholder:
      'typo-body-small text-text-secondary pointer-events-none absolute inset-0 z-1 mr-12 flex items-center gap-2',
    placeholderLogoWrapper: 'w-1/5 max-w-24',
    helperTextWrapper: 'flex items-center gap-1',
    helperTextIcon: 'text-text-secondary size-4 shrink-0',
    helperText: 'typo-body-small text-text-secondary',
  },
  variants: {
    navigateMode: {
      true: {
        root: 'cursor-pointer',
      },
    },
    showPlaceholderGraphic: {
      true: {
        input: 'caret-transparent',
      },
    },
    error: {
      true: {
        content: 'ring-error-main focus-within:ring-error-main ring-1',
        icon: 'text-error-main',
        input: [
          'caret-text-error',
          'selection:bg-error-light selection:text-error-main',
        ],
        helperTextIcon: 'text-text-error',
        helperText: 'text-text-error',
      },
    },
  },
  defaultVariants: {
    navigateMode: false,
    showPlaceholderGraphic: false,
    error: false,
  },
})

export type SearchInputSlots = keyof ReturnType<typeof searchInputVariants>
