'use client'

import { useCallback } from 'react'

import { EVENTS, GtmTransformer, track } from '@/helpers/analytics'

import type { ListingProductSummary } from '@/api/models'

type ProductListIdentity = {
  itemListId: string
  itemListName: string
}

/**
 * GA4 list tracking for a product list: `view_item_list` per card impression
 * and `select_item` per card open, both carrying the card's position in the list.
 */
export function useProductListTracking(list: ProductListIdentity) {
  const { itemListId, itemListName } = list

  const onProductVisible = useCallback(
    (product: ListingProductSummary, index: number) => {
      track(EVENTS.VIEW_ITEM_LIST, {
        gtm: {
          ecommerce: GtmTransformer.toViewItemList({
            itemListId,
            itemListName,
            products: [product],
            startIndex: index,
          }),
        },
      })
    },
    [itemListId, itemListName],
  )

  const onProductOpen = useCallback(
    (product: ListingProductSummary, index: number) => {
      track(EVENTS.SELECT_ITEM, {
        gtm: {
          ecommerce: GtmTransformer.toSelectItem({
            itemListId,
            itemListName,
            product,
            index,
          }),
        },
      })
    },
    [itemListId, itemListName],
  )

  return { onProductVisible, onProductOpen }
}
