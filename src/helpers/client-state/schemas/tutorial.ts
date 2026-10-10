import { z } from 'zod'

export const tutorialStateSchema = z.object({
  seen: z.boolean().default(false),
  timestamp: z.number().int().nonnegative().nullable().default(null),
})
