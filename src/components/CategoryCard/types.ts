import type { ComponentPropsWithRef } from 'react'

import type { ListingCategory, ListingShowcaseCategory } from '@/api/models'

import type { CategoryCardSkeletonSlots, CategoryCardSlots } from './variants'

export type CategoryCardProps = ComponentPropsWithRef<'button'> & {
  category: ListingCategory | ListingShowcaseCategory
  className?: string
  classNames?: Partial<Record<CategoryCardSlots, string>>
}

export type CategoryCardSkeletonProps = {
  className?: string
  classNames?: Partial<Record<CategoryCardSkeletonSlots, string>>
}
