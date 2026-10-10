import type { ComponentPropsWithRef } from 'react'

import type { ListingProduct } from '@/api/models'

import type { PriceTagSlots } from './variants'

export type PriceTagProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  product: ListingProduct
  classNames?: Partial<Record<PriceTagSlots, string>>
}
