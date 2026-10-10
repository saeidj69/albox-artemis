import { z } from 'zod'

export const addToCartPreviewStateSchema = z.object({
  lastTimestamp: z.number().int().nonnegative().nullable().default(null),
  ordersCount: z.number().int().nonnegative().nullable().default(null),
})
