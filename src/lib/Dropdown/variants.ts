import { tv } from 'tailwind-variants'

export const dropdownVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: '',
    labelText: 'typo-label-medium text-text-secondary',
    labelOptionalText: 'typo-body-small text-text-secondary mr-1',
    trigger: [
      'rounded-brand border-border-darker flex w-full items-center border',
      'focus-visible:border-primary-950 hover:border-primary-950 outline-none',
      'data-[state=open]:border-primary-950',
      'w-full cursor-pointer duration-100',
    ],
    start: 'ml-2',
    valueWrapper: 'flex flex-1',
    value: ['text-start', 'data-placeholder:text-text-secondary'],
    end: 'mr-2',
    icon: 'text-text-secondary size-5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180',
    content: [
      'rounded-brand border-border-lighter bg-background-main z-50 overflow-hidden border shadow-lg',
      'w-(--radix-select-trigger-width)',
    ],
    viewport: 'p-1',
    item: [
      'rounded-brand typo-body-medium text-text-primary flex cursor-pointer items-center justify-between px-3 py-2.5 outline-none select-none',
      'data-highlighted:bg-background-secondary',
      'data-disabled:text-text-disabled data-disabled:cursor-not-allowed',
    ],
    itemIndicator: 'text-secondary-600 size-4.5',
    helperText: 'typo-body-small text-text-secondary',
    helperTextIcon: 'text-text-secondary size-4',
    length: 'typo-body-small text-text-secondary',
    helperArea: 'flex items-center justify-between gap-1',
    helperTextWrapper: 'flex items-center gap-1',
  },
  variants: {
    size: {
      small: {
        trigger: 'p-3 py-2',
        value: 'typo-body-small',
        icon: 'size-4',
      },
      medium: {
        trigger: 'p-4 py-3.5',
        value: 'typo-body-medium',
        icon: 'size-5',
      },
      large: {
        trigger: 'p-5 py-4',
        value: 'typo-body-large',
        icon: 'size-6',
      },
    },
    disabled: {
      true: {
        labelText: 'text-text-disabled',
        labelOptionalText: 'text-text-disabled',
        trigger: [
          'hover:border-border-darker cursor-not-allowed',
          'bg-background-secondary',
        ],
        value: 'text-text-disabled',
        start: 'text-text-disabled',
        end: 'text-text-disabled',
        icon: 'text-text-disabled',
      },
    },
    error: {
      true: {
        trigger: [
          'border-error-main focus-within:border-error-main',
          'hover:border-error-main',
        ],
        value: 'text-text-error',
        helperText: 'text-text-error',
        helperTextIcon: 'text-text-error',
        length: 'text-text-error',
        start: 'text-error-main',
        end: 'text-error-main',
        icon: 'text-error-main',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
    disabled: false,
    error: false,
  },
})

export type DropdownSlots = keyof ReturnType<typeof dropdownVariants>

export const dropdownSkeletonVariants = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'h-4 w-24 rounded',
    field: 'rounded-brand w-full',
  },
  variants: {
    size: {
      small: { field: 'h-10' },
      medium: { field: 'h-12' },
      large: { field: 'h-14' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

export type DropdownSkeletonSlots = keyof ReturnType<
  typeof dropdownSkeletonVariants
>
