import type { ComponentPropsWithRef } from 'react'

import { Accordion as AccordionPrimitive } from 'radix-ui'

import type { AccordionSlots } from './variants'

export type AccordionRootProps = ComponentPropsWithRef<
  typeof AccordionPrimitive.Root
> & {
  classNames?: Partial<Record<AccordionSlots, string>>
}

export type AccordionItemProps = ComponentPropsWithRef<
  typeof AccordionPrimitive.Item
> & {
  classNames?: Partial<Record<AccordionSlots, string>>
}

export type AccordionTriggerProps = ComponentPropsWithRef<
  typeof AccordionPrimitive.Trigger
> & {
  classNames?: Partial<Record<AccordionSlots, string>>
}

export type AccordionContentProps = ComponentPropsWithRef<
  typeof AccordionPrimitive.Content
> & {
  classNames?: Partial<Record<AccordionSlots, string>>
}
