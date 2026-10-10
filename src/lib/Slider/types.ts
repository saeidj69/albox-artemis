import type { ComponentPropsWithoutRef } from 'react'

import { Slider as SliderPrimitive } from 'radix-ui'

import type { SliderSkeletonSlots, SliderSlots } from './variants'

export type SliderProps = ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  /**
   * Class names for the slider slots.
   */
  classNames?: Partial<Record<SliderSlots, string>>
}

export interface SliderSkeletonProps {
  className?: string
  classNames?: Partial<Record<SliderSkeletonSlots, string>>
}
