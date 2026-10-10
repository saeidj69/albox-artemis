import { z } from 'zod'

import type { BasketLine } from '../types'

const baseLineSchema = z.object({
  quantity: z.number().int().positive(),
  title: z.string(),
  priceWhenAdded: z.number(),
  addedAt: z.number(),
})

const basketLineSchema = z.union([
  baseLineSchema.extend({ type: z.literal('product'), productId: z.number() }),
  baseLineSchema.extend({ type: z.literal('bundle'), bundleId: z.number() }),
])

const basketLinesSchema = z.array(basketLineSchema)

/**
 * Parses+validates a `client-state` value into `BasketLine[]`. Returns
 * `null` on any malformed/unexpected shape rather than throwing — sync
 * code treats an unparseable server value the same as "no server value".
 */
export function parseServerBasketLines(raw: string): BasketLine[] | null {
  try {
    const parsed = basketLinesSchema.safeParse(JSON.parse(raw))
    return parsed.success ? (parsed.data as BasketLine[]) : null
  } catch {
    return null
  }
}
