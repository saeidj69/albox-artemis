import type { ReactNode } from 'react'

import type { Select as SelectPrimitive } from 'radix-ui'
import type { VariantProps } from 'tailwind-variants'

import { dropdownSkeletonVariants, dropdownVariants } from './variants'
import type { DropdownSkeletonSlots, DropdownSlots } from './variants'

export interface DropdownOption {
  /**
   * Value of the option.
   */
  value: string

  /**
   * Label of the option.
   */
  label: ReactNode

  /**
   * Disable this option.
   */
  disabled?: boolean
}

export interface DropdownProps
  extends
    Omit<SelectPrimitive.SelectProps, 'dir'>,
    VariantProps<typeof dropdownVariants> {
  /**
   * Options rendered inside the dropdown content.
   */
  options: DropdownOption[]

  /**
   * Placeholder shown when no value is selected.
   */
  placeholder?: string

  /**
   * Optional start element
   */
  start?: ReactNode

  /**
   * Label of the dropdown
   */
  label?: string

  /**
   * Optional field
   */
  optional?: boolean

  /**
   * if the dropdown is in error state
   */
  error?: boolean

  /**
   * Helper text
   */
  helperText?: string

  /**
   * Class name for the root element
   */
  className?: string

  /**
   * Class names for the dropdown slots
   */
  classNames?: Partial<Record<DropdownSlots, string>>

  /**
   * id used for the trigger + label association
   */
  id?: string
}

export interface DropdownSkeletonProps extends VariantProps<
  typeof dropdownSkeletonVariants
> {
  className?: string
  classNames?: Partial<Record<DropdownSkeletonSlots, string>>
}
