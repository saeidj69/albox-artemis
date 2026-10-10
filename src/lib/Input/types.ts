import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { inputVariants } from './variants'
import type { InputSkeletonSlots, InputSlots } from './variants'

export interface InputProps
  extends ComponentPropsWithRef<'input'>, VariantProps<typeof inputVariants> {
  /**
   * Optional start element
   */
  start?: ReactNode

  /**
   * Optional end element
   */
  end?: ReactNode

  /**
   * if the input is in error state
   */
  error?: boolean

  /**
   * Helper text
   */
  helperText?: string

  /**
   * Show the length of the input
   */
  showLength?: boolean

  /**
   * Max length of the input
   */
  maxLength?: number

  /**
   * Label of the input
   */
  label?: string

  /**
   * Optional field
   */
  optional?: boolean

  /**
   * Class names for the input slots
   */
  classNames?: Partial<Record<InputSlots, string>>
}

export interface InputSkeletonProps {
  className?: string
  classNames?: Partial<Record<InputSkeletonSlots, string>>
}
