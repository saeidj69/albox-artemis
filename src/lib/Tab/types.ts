import type { ComponentPropsWithRef } from 'react'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type { VariantProps } from 'tailwind-variants'

import type { TabSlots, tabVariants } from './variants'

type TabSizeProps = Pick<VariantProps<typeof tabVariants>, 'size'>

export type TabRootProps = ComponentPropsWithRef<typeof TabsPrimitive.Root> &
  TabSizeProps & {
    classNames?: Partial<Record<TabSlots, string>>
    onChange?: (value: string) => void
  }

export type TabListProps = ComponentPropsWithRef<typeof TabsPrimitive.List> & {
  classNames?: Partial<Record<TabSlots, string>>
}

export type TabTriggerProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Trigger
> & {
  classNames?: Partial<Record<TabSlots, string>>
}

export type TabContentProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Content
> & {
  classNames?: Partial<Record<TabSlots, string>>
}
