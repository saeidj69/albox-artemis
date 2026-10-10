import { describe, expect, test } from 'vitest'

import { interleaveByAnchor } from './interleave-by-anchor'

type Row = { position: number; label: string }

const row = (position: number, label = `w${position}`): Row => ({
  position,
  label,
})

/** Compact rendering of the result, so expectations read like the screen. */
const shape = (entries: ReturnType<typeof interleaveByAnchor>['entries']) =>
  entries.map((entry) =>
    entry.kind === 'item' ? entry.item : (entry.row as Row).label,
  )

describe('interleaveByAnchor', () => {
  test('puts rows anchored at or above 0 on top, outside the grid', () => {
    const { topRows, entries } = interleaveByAnchor({
      rows: [row(0, 'banner'), row(-3, 'stray')],
      items: ['a', 'b'],
      itemsPerRow: 3,
      mayLoadMore: false,
    })

    expect(topRows.map((r) => r.label)).toEqual(['banner', 'stray'])
    expect(shape(entries)).toEqual(['a', 'b'])
  })

  test('inserts a row after the given number of grid rows', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(2, 'cart')],
      items: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      itemsPerRow: 3,
      mayLoadMore: false,
    })

    // Two rows of three, then the widget, then the remainder.
    expect(shape(entries)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'cart', 'g'])
  })

  test('stacks several rows sharing one anchor', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(1, 'first'), row(1, 'second')],
      items: ['a', 'b', 'c', 'd'],
      itemsPerRow: 2,
      mayLoadMore: false,
    })

    expect(shape(entries)).toEqual(['a', 'b', 'first', 'second', 'c', 'd'])
  })

  test('flushes anchors past the end once everything is loaded', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(9, 'deep'), row(4, 'deeper-first')],
      items: ['a', 'b', 'c'],
      itemsPerRow: 3,
      mayLoadMore: false,
    })

    // Sorted by anchor, appended after the single loaded row.
    expect(shape(entries)).toEqual(['a', 'b', 'c', 'deeper-first', 'deep'])
  })

  test('holds back out-of-range anchors while more items may load', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(9, 'deep')],
      items: ['a', 'b', 'c'],
      itemsPerRow: 3,
      mayLoadMore: true,
    })

    expect(shape(entries)).toEqual(['a', 'b', 'c'])
  })

  test('renders no entries, and no premature widgets, before items load', () => {
    const { topRows, entries } = interleaveByAnchor({
      rows: [row(0, 'banner'), row(2, 'cart')],
      items: [],
      itemsPerRow: 3,
      mayLoadMore: true,
    })

    expect(topRows.map((r) => r.label)).toEqual(['banner'])
    expect(entries).toEqual([])
  })

  test('keeps a partial last row intact', () => {
    const { entries } = interleaveByAnchor({
      rows: [],
      items: ['a', 'b', 'c', 'd'],
      itemsPerRow: 3,
      mayLoadMore: false,
    })

    expect(shape(entries)).toEqual(['a', 'b', 'c', 'd'])
  })

  test('numbers widgets sequentially for animation staggering', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(1, 'one'), row(2, 'two')],
      items: ['a', 'b', 'c', 'd'],
      itemsPerRow: 2,
      mayLoadMore: false,
    })

    const widgets = entries.filter((entry) => entry.kind === 'widget')
    expect(widgets.map((w) => w.widgetIndex)).toEqual([0, 1])
    // Keys stay unique so React can keep rows stable across pagination.
    expect(new Set(widgets.map((w) => w.key)).size).toBe(2)
  })

  test('treats a zero or negative itemsPerRow as one column', () => {
    const { entries } = interleaveByAnchor({
      rows: [row(1, 'w')],
      items: ['a', 'b'],
      itemsPerRow: 0,
      mayLoadMore: false,
    })

    expect(shape(entries)).toEqual(['a', 'w', 'b'])
  })
})
