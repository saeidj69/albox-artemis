import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { flipDigitsVariants } from './variants'
import type { FlipDigitsSkeletonSlots, FlipDigitsSlots } from './variants'

export interface FlipDigitsProps
  extends
    ComponentPropsWithRef<'div'>,
    VariantProps<typeof flipDigitsVariants> {
  /**
   * The numeric value to display
   */
  value?: number

  /**
   * Minimum number of digits to display (pads with leading zeros)
   */
  minDigits?: number

  /**
   * Class names for the flip digits slots.
   */
  classNames?: Partial<Record<FlipDigitsSlots, string>>
}

export interface FlipDigitsSkeletonProps {
  className?: string
  classNames?: Partial<Record<FlipDigitsSkeletonSlots, string>>
  /** Number of digit placeholders. @default 2 */
  digits?: number
}
