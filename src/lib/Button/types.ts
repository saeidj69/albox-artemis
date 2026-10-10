import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { buttonSkeletonVariants, buttonVariants } from './variants'
import type { ButtonSlots } from './variants'

type ButtonOwnProps = {
  /**
   * Optional start icon element
   */
  startIcon?: ReactNode

  /**
   * Optional end icon element
   */
  endIcon?: ReactNode

  /**
   * Button content
   */
  children: ReactNode

  /**
   * Class names for the button slots
   */
  classNames?: Partial<Record<ButtonSlots, string>>
} & VariantProps<typeof buttonVariants>

type PolymorphicButtonProps<C extends ElementType> = ButtonOwnProps & {
  /**
   * Component to render as (button, a, Link, etc.)
   * @default 'button'
   */
  as?: C
} & Omit<ComponentPropsWithRef<C>, keyof ButtonOwnProps>

export type ButtonProps<C extends ElementType = 'button'> =
  PolymorphicButtonProps<C>

export type ButtonSkeletonProps = VariantProps<typeof buttonSkeletonVariants> &
  ButtonOwnProps
