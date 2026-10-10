import {
  AccordionContentComponent,
  AccordionItemComponent,
  AccordionRootComponent,
  AccordionTriggerComponent,
} from './Accordion'

export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
} from './types'
export type { AccordionSlots } from './variants'

const Accordion = Object.assign(AccordionRootComponent, {
  Item: AccordionItemComponent,
  Trigger: AccordionTriggerComponent,
  Content: AccordionContentComponent,
})

export default Accordion

export {
  AccordionContentComponent as AccordionContent,
  AccordionItemComponent as AccordionItem,
  AccordionRootComponent as AccordionRoot,
  AccordionTriggerComponent as AccordionTrigger,
}
