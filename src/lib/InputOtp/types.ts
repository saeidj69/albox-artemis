import type { InputHTMLAttributes } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { inputOtpVariants } from './variants'
import type { InputOtpSkeletonSlots, InputOtpSlots } from './variants'

export interface InputOtpProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'onChange' | 'maxLength'
    >,
    VariantProps<typeof inputOtpVariants> {
  /**
   * Number of single-digit inputs to show (e.g. 5 or 6 for OTP length).
   * @default 5
   */
  length?: number

  /**
   * Current OTP value (controlled). Digits only, no placeholders (e.g. "125").
   */
  value?: string

  /**
   * Called when the OTP value changes. Receives the digits-only string (e.g. "125").
   */
  onChange?: (value: string) => void

  /**
   * Label above the OTP inputs.
   */
  label?: string

  /**
   * Error state (e.g. from form validation).
   */
  error?: boolean

  /**
   * Auto focus the input when it is mounted.
   */
  autoFocus?: boolean

  /**
   * Class names for slots.
   */
  classNames?: Partial<Record<InputOtpSlots, string>>
}

export interface InputOtpSkeletonProps {
  className?: string
  classNames?: Partial<Record<InputOtpSkeletonSlots, string>>
  /** Number of cell placeholders. @default 5 */
  length?: number
}
