import type { ComponentPropsWithRef } from 'react'

import type { ListingBrand } from '@/api/models'

import type { BrandCardSkeletonSlots, BrandCardSlots } from './variants'

export type BrandCardProps = ComponentPropsWithRef<'button'> & {
  brand: ListingBrand
  className?: string
  classNames?: Partial<Record<BrandCardSlots, string>>
}

export type BrandCardSkeletonProps = {
  className?: string
  classNames?: Partial<Record<BrandCardSkeletonSlots, string>>
}
