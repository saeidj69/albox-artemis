import type { ComponentPropsWithRef } from 'react'

import type { ListingProduct } from '@/api/models'

import type {
  HorizontalProductCardSkeletonSlots,
  HorizontalProductCardSlots,
} from './variants'

export type HorizontalProductCardProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  product: ListingProduct
  confirmRemove?: boolean
  state?: 'available' | 'unavailable' | 'not_purchasable'
  classNames?: Partial<Record<HorizontalProductCardSlots, string>>
}

export type HorizontalProductCardSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  classNames?: Partial<Record<HorizontalProductCardSkeletonSlots, string>>
}
