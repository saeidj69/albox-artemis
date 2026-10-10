/** Minimum shape the interleaver needs: the builder row's anchor. */
type AnchoredRow = { position: number }

/**
 * One cell of an interleaved grid: either a list item (occupying a single
 * column) or a builder row (spanning the full grid width).
 */
export type InterleavedEntry<TItem, TRow> =
  | { kind: 'item'; item: TItem; index: number }
  | { kind: 'widget'; key: string; row: TRow; widgetIndex: number }

type InterleaveByAnchorParams<TItem, TRow> = {
  /** Builder rows, each anchored by `position`. */
  rows: TRow[]
  /** The screen's own items (categories, brands, products…). */
  items: TItem[]
  /** Grid columns — an anchor counts rows of this many items. */
  itemsPerRow: number
  /**
   * True while more items may still arrive (initial load or a pending page).
   * Anchors past the loaded rows are held back until this goes false, so a
   * deep anchor doesn't surface prematurely mid-pagination.
   */
  mayLoadMore: boolean
}

type InterleaveByAnchorResult<TItem, TRow> = {
  /** Rows anchored above the grid — always visible, like a header. */
  topRows: TRow[]
  entries: InterleavedEntry<TItem, TRow>[]
}

/**
 * Weave builder rows into a grid of items.
 *
 * A row's `position` is its anchor: the number of grid rows that precede it
 * (0 = above the grid, N = after the Nth row of items). This is the model the
 * admin's interleave builder writes, and it is shared by every grid-shaped
 * prepared screen so placement means the same thing everywhere.
 */
export const interleaveByAnchor = <TItem, TRow extends AnchoredRow>(
  params: InterleaveByAnchorParams<TItem, TRow>,
): InterleaveByAnchorResult<TItem, TRow> => {
  const { rows, items, itemsPerRow, mayLoadMore } = params

  const topRows: TRow[] = []
  const byAnchor = new Map<number, TRow[]>()

  for (const row of rows) {
    const anchor = row.position ?? 0
    if (anchor <= 0) {
      topRows.push(row)
      continue
    }
    const list = byAnchor.get(anchor) ?? []
    list.push(row)
    byAnchor.set(anchor, list)
  }

  const safePerRow = Math.max(1, itemsPerRow)
  const loadedRows = Math.ceil(items.length / safePerRow)
  const entries: InterleavedEntry<TItem, TRow>[] = []
  let widgetIndex = 0

  for (let row = 0; row < loadedRows; row++) {
    for (const anchored of byAnchor.get(row) ?? []) {
      entries.push({
        kind: 'widget',
        key: `w-${row}-${widgetIndex}`,
        row: anchored,
        widgetIndex,
      })
      widgetIndex++
    }
    for (let column = 0; column < safePerRow; column++) {
      const index = row * safePerRow + column
      const item = items[index]
      if (item === undefined) continue
      entries.push({ kind: 'item', item, index })
    }
  }

  // Anchors beyond the loaded rows are flushed at the bottom, but only once
  // everything is loaded — otherwise they would jump to the end mid-scroll.
  if (!mayLoadMore) {
    const trailing: { anchor: number; row: TRow }[] = []
    for (const [anchor, list] of byAnchor) {
      if (anchor >= loadedRows) {
        for (const row of list) trailing.push({ anchor, row })
      }
    }
    trailing.sort((a, b) => a.anchor - b.anchor)
    for (const item of trailing) {
      entries.push({
        kind: 'widget',
        key: `w-tail-${item.anchor}-${widgetIndex}`,
        row: item.row,
        widgetIndex,
      })
      widgetIndex++
    }
  }

  return { topRows, entries }
}
