import type { ListingBaseHydratedPage } from '@/api/models'

/** Union of every hydrated widget the backend can attach to a prepared page. */
export type PreparedHydratedWidget = ListingBaseHydratedPage['widgets'][number]

/**
 * A structure column joined with its resolved widget (see
 * build-rows-from-structure). `style` is the builder's column style bag —
 * currently only `flexBasis` (e.g. "30%") on multi-column banner rows.
 */
export type PreparedHydratedColumn = {
  /** `data-tracking-id` of the widget in this column (see tracking-ids). */
  trackingId: string
  widget: PreparedHydratedWidget
  style: Record<string, string>
}

/**
 * A structure row joined with its resolved widgets (see
 * build-rows-from-structure). `style` is the builder's row style bag
 * (padding / gap / background), applied by PreparedRowRenderer.
 */
export type PreparedHydratedRow = {
  /** `data-tracking-id` of the row band (see tracking-ids). */
  trackingId: string
  position: number
  style: Record<string, string>
  columns: PreparedHydratedColumn[]
}
