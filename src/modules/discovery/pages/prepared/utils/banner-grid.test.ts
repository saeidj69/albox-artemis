import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { ListingBannerHydratedWidget } from '@/api/models'

import type { PreparedPageRow } from '../hooks/use-home-data-populate'
import {
  BANNER_GRID_SPECS,
  getBannerGridLayout,
  isBannerGridRow,
} from './banner-grid'
import { ROW_PRESENTATION } from './row-presentation'

const banner = (
  id: number,
  image: Partial<ListingBannerHydratedWidget['image']> = {},
): ListingBannerHydratedWidget => ({
  id,
  type: 'banner',
  image: {
    original: `banner-${id}.jpg`,
    metadata: {
      id: `media-${id}`,
      type: { value: 'image', label: 'تصویر' },
      originalMimeType: 'image/jpeg',
      originalFileName: `banner-${id}.jpg`,
      originalSize: 1,
    },
    ...image,
  },
  href: `/banner/${id}`,
  styles: {},
})

const gridRow = (
  presentation: string,
  widgets: PreparedPageRow['columns'][number]['widget'][],
): PreparedPageRow => ({
  trackingId: 'row-0',
  position: 0,
  style: { presentation },
  columns: widgets.map((widget) => ({
    trackingId: `banner-${'id' in widget ? widget.id : 'x'}`,
    widget,
    style: {},
  })),
})

const banners = (count: number) =>
  Array.from({ length: count }, (_, index) => banner(index + 1))

/** Slot ids per rendered column, for readable layout assertions. */
const slotIds = (row: PreparedPageRow) =>
  getBannerGridLayout(row)?.columns.map((column) =>
    column.map((cell) => cell.id),
  )

describe('isBannerGridRow', () => {
  test('detects only the three grid markers', () => {
    expect(
      isBannerGridRow({ presentation: ROW_PRESENTATION.BANNER_GRID_MOSAIC }),
    ).toBe(true)
    expect(
      isBannerGridRow({ presentation: ROW_PRESENTATION.BANNER_GRID_QUAD }),
    ).toBe(true)
    expect(
      isBannerGridRow({ presentation: ROW_PRESENTATION.BANNER_GRID_DUO }),
    ).toBe(true)
    expect(isBannerGridRow({ presentation: ROW_PRESENTATION.BILLBOARD })).toBe(
      false,
    )
    expect(isBannerGridRow({})).toBe(false)
    expect(isBannerGridRow()).toBe(false)
  })
})

describe('getBannerGridLayout', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('splits the mosaic into interlocking columns of equal height', () => {
    const row = gridRow(ROW_PRESENTATION.BANNER_GRID_MOSAIC, banners(4))

    expect(slotIds(row)).toEqual([
      [1, 3],
      [2, 4],
    ])

    const spec = BANNER_GRID_SPECS[ROW_PRESENTATION.BANNER_GRID_MOSAIC]
    const columnHeights = spec.columns.map((slots) =>
      slots.reduce((height, slot) => height + 1 / spec.ratios[slot], 0),
    )
    expect(columnHeights[0]).toBeCloseTo(columnHeights[1])
  })

  test('gives every mosaic slot the ratio its position carries in the design', () => {
    const layout = getBannerGridLayout(
      gridRow(ROW_PRESENTATION.BANNER_GRID_MOSAIC, banners(4)),
    )

    // Right column reads square then wide; the left column mirrors it.
    expect(layout?.columns[0].map((cell) => cell.ratio)).toEqual([
      169 / 169,
      169 / 92,
    ])
    expect(layout?.columns[1].map((cell) => cell.ratio)).toEqual([
      169 / 92,
      169 / 169,
    ])
  })

  test('lays the quad out as two rows of two equally wide banners', () => {
    const layout = getBannerGridLayout(
      gridRow(ROW_PRESENTATION.BANNER_GRID_QUAD, banners(4)),
    )

    expect(
      layout?.columns.map((column) => column.map((cell) => cell.id)),
    ).toEqual([
      [1, 3],
      [2, 4],
    ])
    expect(
      layout?.columns.flat().every((cell) => cell.ratio === 169 / 92),
    ).toBe(true)
  })

  test('lays the duo out as one banner per column', () => {
    const layout = getBannerGridLayout(
      gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, banners(2)),
    )

    expect(layout?.columns).toHaveLength(2)
    expect(layout?.columns.flat().map((cell) => cell.ratio)).toEqual([
      169 / 132,
      169 / 132,
    ])
  })

  test('carries each slot its own link and responsive sources', () => {
    const layout = getBannerGridLayout(
      gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, [
        banner(1, { sm: 'small-1', lg: 'large-1' }),
        { ...banner(2), href: null },
      ]),
    )

    expect(layout?.columns[0][0].href).toBe('/banner/1')
    expect(layout?.columns[0][0].srcSet).toBe('small-1 480w, large-1 1440w')
    expect(layout?.columns[0][0].openInNewTab).toBe(false)
    expect(layout?.columns[1][0].href).toBeNull()
    expect(layout?.columns[1][0].openInNewTab).toBe(false)
  })

  test('carries each slot its own new-tab flag', () => {
    const flagged = banner(1)
    flagged.styles = { openInNewTab: 'true' }
    const layout = getBannerGridLayout(
      gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, [flagged, banner(2)]),
    )

    expect(layout?.columns[0][0].openInNewTab).toBe(true)
    expect(layout?.columns[1][0].openInNewTab).toBe(false)
  })

  test('falls back to an ordinary row when the builder did not mark it', () => {
    const row = gridRow(ROW_PRESENTATION.BANNER_GRID_QUAD, banners(4))
    row.style = {}

    expect(getBannerGridLayout(row)).toBeNull()
  })

  test('falls back to an ordinary row when the banner count is wrong', () => {
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_QUAD, banners(3)),
      ),
    ).toBeNull()
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_QUAD, banners(5)),
      ),
    ).toBeNull()
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, banners(4)),
      ),
    ).toBeNull()
    expect(
      getBannerGridLayout(gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, [])),
    ).toBeNull()
  })

  test('falls back to an ordinary row when a column is not a banner', () => {
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, [
          banner(1),
          { type: 'SURENA', surenaCode: 'code' },
        ]),
      ),
    ).toBeNull()
  })

  test('falls back to an ordinary row when a single slot lacks artwork', () => {
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_DUO, [
          banner(1),
          banner(2, { original: '' }),
        ]),
      ),
    ).toBeNull()
  })

  test('falls back to an ordinary row when presentations are flagged off', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')
    expect(
      getBannerGridLayout(
        gridRow(ROW_PRESENTATION.BANNER_GRID_MOSAIC, banners(4)),
      ),
    ).toBeNull()
  })
})
