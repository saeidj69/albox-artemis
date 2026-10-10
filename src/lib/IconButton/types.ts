import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { iconButtonSkeletonVariants, iconButtonVariants } from './variants'
import type { IconButtonSkeletonSlots, IconButtonSlots } from './variants'

type IconButtonOwnProps = {
  /** Icon or node to render inside the button */
  icon?: ReactNode
  /** Same as icon; use either icon or children */
  children?: ReactNode
  /** Class names for slots */
  classNames?: Partial<Record<IconButtonSlots, string>>
} & Pick<
  VariantProps<typeof iconButtonVariants>,
  'variant' | 'size' | 'disabled'
>

type PolymorphicIconButtonProps<C extends ElementType> = IconButtonOwnProps & {
  as?: C
} & Omit<ComponentPropsWithRef<C>, keyof IconButtonOwnProps>

export type IconButtonProps<C extends ElementType = 'button'> =
  PolymorphicIconButtonProps<C>

export type IconButtonSkeletonProps = VariantProps<
  typeof iconButtonSkeletonVariants
> & {
  className?: string
  classNames?: Partial<Record<IconButtonSkeletonSlots, string>>
}
