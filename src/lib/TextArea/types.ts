import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { textAreaVariants } from './variants'
import type { TextAreaSkeletonSlots, TextAreaSlots } from './variants'

export interface TextAreaProps
  extends
    ComponentPropsWithRef<'textarea'>,
    VariantProps<typeof textAreaVariants> {
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
  classNames?: Partial<Record<TextAreaSlots, string>>
}

export interface TextAreaSkeletonProps {
  className?: string
  classNames?: Partial<Record<TextAreaSkeletonSlots, string>>
}
