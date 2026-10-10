import type {
  ListingPageStructure,
  ListingPageStructureContent,
} from '@/api/models'

import type {
  PreparedHydratedColumn,
  PreparedHydratedRow,
  PreparedHydratedWidget,
} from '../types'
import { rowTrackingId, widgetTrackingId } from './tracking-ids'

/** Pick the layout the storefront renders: mobile, falling back to desktop/tablet. */
const pickContent = (
  structure: ListingPageStructure,
): ListingPageStructureContent | undefined => {
  const candidates = [structure.mobile, structure.desktop, structure.tablet]
  return candidates.find((c) => (c?.rows?.length ?? 0) > 0) ?? structure.mobile
}

/**
 * The backend returns a page as `structure` (raw layout: rows -> columns ->
 * widget id) plus a flat hydrated `widgets[]`. The renderers consume
 * `PreparedHydratedRow[]`, so we join them here: each structure row keeps its
 * `position` (used as the product-row anchor on products_grid_page), its row
 * style bag, and its columns with their resolved widgets and column style bags
 * (flexBasis for side-by-side banners). Columns whose widget id is missing
 * from `widgets[]` are skipped; rows left with no columns are dropped.
 */
export const buildRowsFromStructure = (
  structure: ListingPageStructure | null | undefined,
  widgets: PreparedHydratedWidget[] | null | undefined,
): PreparedHydratedRow[] => {
  if (!structure) {
    return []
  }

  const content = pickContent(structure)
  if (!content) {
    return []
  }

  const byId = new Map<number, PreparedHydratedWidget>()
  for (const widget of widgets ?? []) {
    byId.set(widget.id, widget)
  }

  const rows: PreparedHydratedRow[] = []
  for (const row of content.rows ?? []) {
    const columns: PreparedHydratedColumn[] = []
    for (const column of row.columns ?? []) {
      const widget = byId.get(column.widget)
      if (!widget) {
        continue
      }
      columns.push({
        trackingId: widgetTrackingId(widget),
        widget,
        style: column.style ?? {},
      })
    }
    if (columns.length === 0) {
      continue
    }
    rows.push({
      trackingId: rowTrackingId(row),
      position: row.position,
      style: row.style ?? {},
      columns,
    })
  }

  return rows
}
