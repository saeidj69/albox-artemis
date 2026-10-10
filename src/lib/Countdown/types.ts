import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import type { countdownSkeletonVariants, countdownVariants } from './variants'
import type { CountdownSkeletonSlots, CountdownSlots } from './variants'

export type CountdownProps = Omit<ComponentPropsWithRef<'div'>, 'children'> &
  VariantProps<typeof countdownVariants> & {
    /** Epoch milliseconds the countdown runs down to. */
    endsAt: number
    /** Rendered between segments; defaults to `:`. */
    separator?: ReactNode
    classNames?: Partial<Record<CountdownSlots, string>>
  }

export type CountdownSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> &
  VariantProps<typeof countdownSkeletonVariants> & {
    classNames?: Partial<Record<CountdownSkeletonSlots, string>>
  }
