import type { ComponentPropsWithRef } from 'react'

import type { Switch } from 'radix-ui'
import type { VariantProps } from 'tailwind-variants'

import { switchVariants } from './variants'
import type { SwitchSkeletonSlots, SwitchSlots } from './variants'

export type SwitchProps = ComponentPropsWithRef<'button'> &
  Switch.SwitchProps &
  VariantProps<typeof switchVariants> & {
    /**
     * Class names for the switch slots.
     */
    classNames?: Partial<Record<SwitchSlots, string>>
  }

export interface SwitchSkeletonProps {
  className?: string
  classNames?: Partial<Record<SwitchSkeletonSlots, string>>
  /** @default 'medium' */
  size?: 'medium' | 'small'
}
