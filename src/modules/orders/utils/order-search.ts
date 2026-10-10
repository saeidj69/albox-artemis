import { OrderSearchSchema } from '@/modules/orders/validation/order-search-schema'

/**
 * The orders API can only filter by numeric order id. Free text (e.g. a product name)
 * must not be coerced with `Number()`, since that yields `NaN` and the API answers 422.
 */
export const parseOrderIdSearch = (search: string): number | undefined => {
  const result = OrderSearchSchema.safeParse(search)

  if (!result.success || result.data === '') return undefined

  const orderId = Number(result.data)

  return Number.isSafeInteger(orderId) ? orderId : undefined
}
