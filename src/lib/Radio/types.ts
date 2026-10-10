import type { ComponentPropsWithRef } from 'react'

import type { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import type { VariantProps } from 'tailwind-variants'

import { radioGroupVariants } from './variants'
import type { RadioGroupSkeletonSlots, RadioGroupSlots } from './variants'

export type RadioGroupRootProps = ComponentPropsWithRef<'div'> &
  RadioGroupPrimitive.RadioGroupProps &
  VariantProps<typeof radioGroupVariants> & {
    /**
     * Class names for the radio group slots.
     */
    classNames?: Partial<Record<RadioGroupSlots, string>>
  }

export type RadioGroupItemProps = ComponentPropsWithRef<'button'> &
  RadioGroupPrimitive.RadioGroupItemProps &
  VariantProps<typeof radioGroupVariants> & {
    /**
     * Class names for the radio group item slots.
     */
    classNames?: Partial<Record<RadioGroupSlots, string>>
  }

export interface RadioGroupSkeletonProps {
  className?: string
  classNames?: Partial<Record<RadioGroupSkeletonSlots, string>>
  /** Number of radio item placeholders to show. @default 3 */
  count?: number
}
