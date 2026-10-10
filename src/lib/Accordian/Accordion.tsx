'use client'

import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
} from './types'
import { accordionVariants } from './variants'

const AccordionRootComponent = (props: AccordionRootProps) => {
  const { className, classNames, ref, ...otherProps } = props
  const slots = accordionVariants()

  return (
    <AccordionPrimitive.Root
      ref={ref}
      data-slot="accordion"
      className={cn(slots.root({ className }), classNames?.root)}
      {...otherProps}
    />
  )
}

const AccordionItemComponent = (props: AccordionItemProps) => {
  const { className, classNames, ref, ...otherProps } = props
  const slots = accordionVariants()

  return (
    <AccordionPrimitive.Item
      ref={ref}
      data-slot="accordion-item"
      className={cn(slots.item({ className }), classNames?.item)}
      {...otherProps}
    />
  )
}

const AccordionTriggerComponent = (props: AccordionTriggerProps) => {
  const { children, className, classNames, ref, ...otherProps } = props
  const slots = accordionVariants()

  return (
    <AccordionPrimitive.Header
      className={cn(slots.header(), classNames?.header)}
    >
      <AccordionPrimitive.Trigger
        ref={ref}
        data-slot="accordion-trigger"
        className={cn(slots.trigger({ className }), classNames?.trigger)}
        {...otherProps}
      >
        {children}
        <RiArrowDownSLine
          data-slot="accordion-trigger-icon"
          aria-hidden
          className={cn(
            slots.triggerIcon(),
            classNames?.triggerIcon,
            'group-data-[state=open]/accordion-trigger:hidden',
          )}
        />
        <RiArrowUpSLine
          data-slot="accordion-trigger-icon-expanded"
          aria-hidden
          className={cn(
            slots.triggerIcon(),
            classNames?.triggerIcon,
            'hidden group-data-[state=open]/accordion-trigger:inline',
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

const AccordionContentComponent = (props: AccordionContentProps) => {
  const { children, className, classNames, ref, ...otherProps } = props
  const slots = accordionVariants()

  return (
    <AccordionPrimitive.Content
      ref={ref}
      data-slot="accordion-content"
      className={cn(slots.content({ className }), classNames?.content)}
      {...otherProps}
    >
      <div
        data-slot="accordion-content-inner"
        className={cn(slots.contentInner(), classNames?.contentInner)}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export {
  AccordionRootComponent,
  AccordionItemComponent,
  AccordionTriggerComponent,
  AccordionContentComponent,
}
