import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { SearchItemSkeletonSlots, SearchItemSlots } from './variants'

export type SearchItemProps = ComponentPropsWithRef<'button'> & {
  icon?: ReactNode
  title: string
  subtitle?: string
  className?: string
  classNames?: Partial<Record<SearchItemSlots, string>>
}

export type SearchItemSkeletonProps = {
  withSubtitle?: boolean
  withIcon?: boolean
  className?: string
  classNames?: Partial<Record<SearchItemSkeletonSlots, string>>
}
