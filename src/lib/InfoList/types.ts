import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { InfoListSkeletonSlots, InfoListSlots } from './variants'

export type InfoListItem = {
  label: ReactNode
  value: ReactNode
  emphasized?: boolean
}

export type InfoListVariant = 'default' | 'plain'

export type InfoListProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  items: InfoListItem[]
  variant?: InfoListVariant
  classNames?: Partial<Record<InfoListSlots, string>>
}

export type InfoListSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  rowCount?: number
  variant?: InfoListVariant
  classNames?: Partial<Record<InfoListSkeletonSlots, string>>
}
