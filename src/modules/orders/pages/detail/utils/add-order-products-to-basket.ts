import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { useLocation } from '@/modules/addresses/hooks'
import { basketLinesAtom } from '@/modules/purchase/atoms'
import { getBasketLineKey } from '@/modules/purchase/types'
import type { BasketLine } from '@/modules/purchase/types'

import {
  getGetProductListingQueryKey,
  getProductListing,
} from '@/api/functions/catalogue'
import type { OrderOrderProduct } from '@/api/models'

export const useAddOrderProductsToBasket = () => {
  const queryClient = useQueryClient()
  const setBasketLines = useSetAtom(basketLinesAtom)

  const { location, isLoading: isLocationLoading } = useLocation()

  return useCallback(
    async (products: OrderOrderProduct[]): Promise<number> => {
      if (isLocationLoading) return 0

      const results = await Promise.allSettled(
        products.map((product) =>
          queryClient.fetchQuery({
            queryKey: getGetProductListingQueryKey(product.productId),
            queryFn: () =>
              getProductListing(product.productId, {
                latitude: location.latitude,
                longitude: location.longitude,
              }),
          }),
        ),
      )

      let addedCount = 0

      setBasketLines((prev) => {
        const next = [...prev]

        results.forEach((result, index) => {
          if (result.status !== 'fulfilled') return

          const listingProduct = result.value.product
          const maxQty = listingProduct.purchasableQuantity
          if (maxQty <= 0) return

          const quantity = Math.min(products[index].quantity, maxQty)
          if (quantity <= 0) return

          const line: BasketLine = {
            type: 'product',
            productId: listingProduct.id,
            quantity,
            title: listingProduct.name,
            priceWhenAdded: listingProduct.boxDiscountedPrice,
            addedAt: Date.now(),
          }

          const key = getBasketLineKey(line)
          const existingIndex = next.findIndex(
            (item) => getBasketLineKey(item) === key,
          )

          if (existingIndex >= 0) {
            next[existingIndex] = {
              ...next[existingIndex],
              quantity,
              title: line.title,
              priceWhenAdded: line.priceWhenAdded,
            }
          } else {
            next.push(line)
          }

          addedCount += 1
        })

        return next
      })

      return addedCount
    },
    [queryClient, setBasketLines, location, isLocationLoading],
  )
}
