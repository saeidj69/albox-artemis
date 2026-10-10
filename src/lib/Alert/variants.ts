import { tv } from 'tailwind-variants'

export const alertVariants = tv({
  slots: {
    root: 'rounded-brand flex gap-3 border p-4',
    icon: 'mt-0.5 size-5 shrink-0',
    content: 'flex min-w-0 flex-1 flex-col gap-1',
    title: 'typo-title-x-small',
    description: 'typo-body-small',
    actions: 'mt-2 flex flex-wrap justify-end gap-2',
    action: '',
  },
  variants: {
    variant: {
      basic: {
        root: 'bg-background-secondary border-border-main',
        icon: 'text-text-secondary',
        title: 'text-text-primary',
        description: 'text-text-secondary',
        action: 'text-text-primary',
      },
      info: {
        root: 'bg-info-lighter border-info-light',
        icon: 'text-info-main',
        title: 'text-info-dark',
        description: 'text-info-dark/80',
        action: 'text-info-dark',
      },
      warning: {
        root: 'bg-warning-lighter border-warning-light',
        icon: 'text-warning-main',
        title: 'text-warning-dark',
        description: 'text-warning-dark/80',
        action: 'text-warning-dark',
      },
      success: {
        root: 'bg-success-lighter border-success-light',
        icon: 'text-success-main',
        title: 'text-success-dark',
        description: 'text-success-dark/80',
        action: 'text-success-dark',
      },
      error: {
        root: 'bg-error-light border-error-lighter',
        icon: 'text-error-main',
        title: 'text-error-dark',
        description: 'text-error-dark/80',
        action: 'text-error-dark',
      },
    },
  },
  defaultVariants: {
    variant: 'basic',
  },
})

export type AlertSlots = keyof ReturnType<typeof alertVariants>

export const alertSkeletonVariants = tv({
  slots: {
    root: 'rounded-brand border-border-lighter bg-background-secondary flex gap-3 border p-4',
    icon: 'mt-0.5 size-5 shrink-0 rounded-full',
    content: 'flex flex-1 flex-col gap-2',
    title: 'h-4 w-32 rounded',
    description: 'h-3 w-full rounded',
  },
})

export type AlertSkeletonSlots = keyof ReturnType<typeof alertSkeletonVariants>
