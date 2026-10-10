import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'

import type { VariantProps } from 'tailwind-variants'

import { chipSkeletonVariants, chipVariants } from './variants'
import type { ChipSkeletonSlots, ChipSlots } from './variants'

type ChipOwnProps = {
  /**
   * Main label or content.
   */
  content: ReactNode

  /**
   * Optional leading slot (e.g. icon).
   */
  start?: ReactNode

  /**
   * Optional trailing slot (e.g. icon).
   */
  end?: ReactNode

  /**
   * Class names for the chip slots.
   */
  classNames?: Partial<Record<ChipSlots, string>>
} & Omit<VariantProps<typeof chipVariants>, 'interactive' | 'disabled'>

type PolymorphicChipProps<C extends ElementType> = ChipOwnProps & {
  /**
   * Component to render as (button, a, Link, etc.)
   * @default 'button' when `onClick` is set, otherwise `'div'`
   */
  as?: C
  styles?: Partial<Record<ChipSlots, CSSProperties>>
} & Omit<ComponentPropsWithRef<C>, keyof ChipOwnProps>

export type ChipProps<C extends ElementType = 'button'> =
  PolymorphicChipProps<C>

export type ChipSkeletonProps = {
  className?: string
  classNames?: Partial<Record<ChipSkeletonSlots, string>>
} & VariantProps<typeof chipSkeletonVariants>
