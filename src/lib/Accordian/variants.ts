import { tv } from 'tailwind-variants'

export const accordionVariants = tv({
  slots: {
    root: 'flex w-full flex-col',
    item: 'border-border-lighter border-b last:border-b-0',
    header: 'flex',
    trigger:
      'group/accordion-trigger typo-body-medium text-text-primary focus-visible:ring-border-main relative flex flex-1 cursor-pointer items-start justify-between gap-2 border border-transparent px-4 py-3 text-right transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
    triggerIcon: 'text-text-secondary pointer-events-none size-5 shrink-0',
    content:
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm',
    contentInner:
      'typo-body-medium text-text-secondary px-4 pt-0 pb-3 whitespace-pre-line [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-2',
  },
})

export type AccordionSlots = keyof ReturnType<typeof accordionVariants>
