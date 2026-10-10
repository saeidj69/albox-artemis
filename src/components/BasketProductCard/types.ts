import type { ComponentPropsWithRef, ReactNode } from 'react'

import { ProductBasketLine } from '@/modules/purchase/types'

import type {
  OrderNotFoundBasketProduct,
  OrderNotOkBasketProduct,
  OrderOkBasketProduct,
} from '@/api/models'

import type {
  BasketProductCardSkeletonSlots,
  BasketProductCardSlots,
} from './variants'

export type BasketProductCardProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  product:
    | OrderOkBasketProduct
    | OrderNotOkBasketProduct
    | OrderNotFoundBasketProduct

  localProduct: ProductBasketLine
  /** Rendered below the card body (e.g. price/qty alerts). */
  children?: ReactNode

  classNames?: Partial<Record<BasketProductCardSlots, string>>
}

export type BasketProductCardSkeletonProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  classNames?: Partial<Record<BasketProductCardSkeletonSlots, string>>
}
