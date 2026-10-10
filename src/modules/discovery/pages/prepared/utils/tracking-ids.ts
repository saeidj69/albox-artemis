/**
 * Tracking ids rendered as `data-tracking-id` on rows, widgets and their items.
 * They derive from backend ids/positions only — never array indexes — so they
 * stay stable across renders and reorders, and are unique within one page.
 * The page URL supplies page context, so ids carry no page prefix.
 */

/** Client-injected Surena banner; it has no backend widget id. */
export const SURENA_TRACKING_ID = 'surena'

/** Client-injected Surena row; `row-0` may already belong to a real row. */
export const SURENA_ROW_TRACKING_ID = 'row-surena'

/** Client-injected NMV card; it has no backend widget id. */
export const NMV_TRACKING_ID = 'nmv'

/** Client-injected NMV row, pinned under Surena on home. */
export const NMV_ROW_TRACKING_ID = 'row-nmv'

export const rowTrackingId = (row: { position: number }): string =>
  `row-${row.position}`

export const widgetTrackingId = (widget: {
  type: string
  id: number
}): string => `${widget.type}-${widget.id}`

export const childTrackingId = (
  parentId: string,
  kind: 'slide' | 'product',
  key: string | number,
): string => `${parentId}-${kind}-${key}`
