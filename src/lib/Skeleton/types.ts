import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { skeletonVariants } from './variants'
import type { SkeletonSlots } from './variants'

export type SkeletonProps = ComponentPropsWithRef<'div'> &
  VariantProps<typeof skeletonVariants> & {
    classNames?: Partial<Record<SkeletonSlots, string>>
  }
