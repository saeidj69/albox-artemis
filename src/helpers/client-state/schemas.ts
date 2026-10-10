import { z } from 'zod'

import { addToCartPreviewStateSchema } from './schemas/add-to-cart-preview'
import { experimentsStateSchema } from './schemas/experiments'
import { tutorialStateSchema } from './schemas/tutorial'

export { addToCartPreviewStateSchema }

export const clientStateSchemas = {
  addToCartPreview: addToCartPreviewStateSchema,
  tutorial: tutorialStateSchema,
  experiments: experimentsStateSchema,
} as const

/** Maps each schema key to its server-side API path key. */
export const clientStateApiKeys = {
  addToCartPreview: 'cart-add-preview',
  tutorial: 'tutorial',
  experiments: 'experiments',
} as const satisfies Record<keyof typeof clientStateSchemas, string>

export type ClientStateSchemaKey = keyof typeof clientStateSchemas

export type ClientStateValue<K extends ClientStateSchemaKey> = z.infer<
  (typeof clientStateSchemas)[K]
>
