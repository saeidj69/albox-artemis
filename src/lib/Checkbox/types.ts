import type { ComponentPropsWithRef } from 'react'

import type { Checkbox } from 'radix-ui'
import type { VariantProps } from 'tailwind-variants'

import { checkboxVariants } from './variants'
import type { CheckboxSkeletonSlots, CheckboxSlots } from './variants'

export type CheckboxProps = ComponentPropsWithRef<'button'> &
  Checkbox.CheckboxProps &
  VariantProps<typeof checkboxVariants> & {
    /**
     * Class names for the checkbox slots.
     */
    classNames?: Partial<Record<CheckboxSlots, string>>
  }

export interface CheckboxSkeletonProps {
  className?: string
  classNames?: Partial<Record<CheckboxSkeletonSlots, string>>
}
