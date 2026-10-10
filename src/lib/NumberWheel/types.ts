import type { ComponentPropsWithRef } from 'react'

import type { NumberWheelSkeletonSlots, NumberWheelSlots } from './variants'

export type NumberWheelProps = Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue'
> & {
  /** Inclusive lower bound of the number range. */
  min: number
  /** Inclusive upper bound of the number range. */
  max: number
  /** Controlled value. If provided, the wheel scrolls to match on change. */
  value?: number
  /** Uncontrolled initial value. Ignored when `value` is provided. */
  defaultValue?: number
  /** Fires when the centered item changes. */
  onChange?: (value: number) => void
  /** Transform each number before it's rendered (e.g. `persianDigits`). */
  formatter?: (n: number) => string
  /** Width of each item cell, in px. @default 56 */
  itemWidth?: number
  /** Height of the track (and each item), in px. @default 72 */
  height?: number
  /** Side of the centered highlight box, in px. @default 48 */
  highlightSize?: number
  /** Per-slot class overrides. */
  classNames?: Partial<Record<NumberWheelSlots, string>>
}

export type NumberWheelSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  /** Height of the skeleton, in px. @default 72 */
  height?: number
  classNames?: Partial<Record<NumberWheelSkeletonSlots, string>>
}
