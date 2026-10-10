import type { PreparedHydratedRow } from '../types'

/**
 * Guarantees a predictable, position-sorted `PreparedHydratedRow[]`. Rows are
 * built from the page `structure` + `widgets` (see build-rows-from-structure);
 * this also tolerates a single-row or nullish input.
 */
export const normalizeHydratedRows = (
  rows: PreparedHydratedRow | PreparedHydratedRow[] | null | undefined,
): PreparedHydratedRow[] => {
  if (!rows) {
    return []
  }

  const list = Array.isArray(rows) ? rows : [rows]

  return list
    .filter(
      (row): row is PreparedHydratedRow =>
        !!row && typeof row === 'object' && (row.columns?.length ?? 0) > 0,
    )
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
