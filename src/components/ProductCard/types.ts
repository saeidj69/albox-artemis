import type { ComponentPropsWithRef } from 'react'

import type { ListingProductSummary } from '@/api/models'

import type { ProductCardSkeletonSlots } from './variants'

export type ProductCardProps = {
  product: ListingProductSummary
  addToCartOptions?: {
    preview?: boolean
    onFirstAdd?: () => void
  }
  onProductOpen?: () => void
}

export type ProductCardSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  classNames?: Partial<Record<ProductCardSkeletonSlots, string>>
}
