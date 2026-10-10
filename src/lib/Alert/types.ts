import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { VariantProps } from 'tailwind-variants'

import type { ButtonProps } from '@/lib/Button/types'

import type { AlertSkeletonSlots, AlertSlots } from './variants'
import { alertVariants } from './variants'

export type AlertProps = Omit<ComponentPropsWithRef<'div'>, 'title'> &
  VariantProps<typeof alertVariants> & {
    /** Optional bold title line */
    title?: ReactNode
    /** Optional icon; defaults to the variant icon */
    icon?: ReactNode
    /** Optional action buttons rendered below the description */
    actions?: (ButtonProps & { id: string })[]
    /** Per-slot className overrides */
    classNames?: Partial<Record<AlertSlots, string>>
  }

export type AlertSkeletonProps = ComponentPropsWithRef<'div'> & {
  classNames?: Partial<Record<AlertSkeletonSlots, string>>
}
