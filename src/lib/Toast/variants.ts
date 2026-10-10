import { tv } from 'tailwind-variants'

export const toastVariants = tv({
  slots: {
    toast: [
      'rounded-brand flex w-full max-w-[420px] gap-3 border p-4',
      'items-start text-right',
      'bg-background-secondary border-border-main text-text-primary',
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-1',
    message: 'typo-title-small',
    description: 'typo-body-small',
    icon: 'mt-0.5 size-5 shrink-0',
    closeButton:
      'inline-flex size-5 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2',
  },
})

export type ToastSlots = keyof ReturnType<typeof toastVariants>
