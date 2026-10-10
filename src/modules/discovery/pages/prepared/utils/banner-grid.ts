import { isPageBuilderPresentationsEnabled } from '@/constants/feature-flags'

import type { Media } from '@/api/models'

import type { PreparedPageRow } from '../hooks/use-home-data-populate'
import { isBannerOpenInNewTab } from './banner-link'
import { bannerSrcSet, isBannerWidget } from './banner-media'
import { ROW_PRESENTATION, ROW_PRESENTATION_KEY } from './row-presentation'

/** Cell footprints measured on the 350px-wide mobile design (169px columns). */
const RATIO_SQUARE = 169 / 169
const RATIO_WIDE = 169 / 92
const RATIO_TALL = 169 / 132

export type BannerGridPresentation =
  | typeof ROW_PRESENTATION.BANNER_GRID_MOSAIC
  | typeof ROW_PRESENTATION.BANNER_GRID_QUAD
  | typeof ROW_PRESENTATION.BANNER_GRID_DUO

export type BannerGridSpec = {
  /** Banner widgets the row must hold for the layout to apply. */
  slotCount: number
  /** Aspect ratio (width / height) per slot, in authoring order. */
  ratios: readonly number[]
  /**
   * Slot indices per rendered column. The first column is the rightmost one
   * because the storefront is RTL, so slots read 1..n top-right to bottom-left.
   */
  columns: readonly (readonly number[])[]
}

/**
 * Every layout is two equal-width columns of stacked cells, so one renderer
 * covers all three; only the ratios and the slot-to-column mapping differ.
 *
 * Mosaic interlocks a square and a wide cell per column, which is why both
 * columns still end up the same height (169 + 12 + 92 = 273 either way).
 */
export const BANNER_GRID_SPECS: Record<BannerGridPresentation, BannerGridSpec> =
  {
    [ROW_PRESENTATION.BANNER_GRID_MOSAIC]: {
      slotCount: 4,
      ratios: [RATIO_SQUARE, RATIO_WIDE, RATIO_WIDE, RATIO_SQUARE],
      columns: [
        [0, 2],
        [1, 3],
      ],
    },
    [ROW_PRESENTATION.BANNER_GRID_QUAD]: {
      slotCount: 4,
      ratios: [RATIO_WIDE, RATIO_WIDE, RATIO_WIDE, RATIO_WIDE],
      columns: [
        [0, 2],
        [1, 3],
      ],
    },
    [ROW_PRESENTATION.BANNER_GRID_DUO]: {
      slotCount: 2,
      ratios: [RATIO_TALL, RATIO_TALL],
      columns: [[0], [1]],
    },
  }

export type BannerGridCell = {
  id: number
  trackingId: string
  media: Media
  srcSet: string
  href: string | null
  openInNewTab: boolean
  ratio: number
}

export type BannerGridLayout = {
  presentation: BannerGridPresentation
  /** Cells per rendered column; the first column is the rightmost one. */
  columns: BannerGridCell[][]
}

export const isBannerGridPresentation = (
  value: string | undefined,
): value is BannerGridPresentation =>
  value != null && value in BANNER_GRID_SPECS

export const isBannerGridRow = (style?: Record<string, string>): boolean =>
  isBannerGridPresentation(style?.[ROW_PRESENTATION_KEY])

/**
 * Cells for a banner grid row, or null when the row must render as an ordinary
 * column row instead: unmarked by the builder, holding the wrong number of
 * banners, mixing in a non-banner widget, or missing artwork on any slot.
 *
 * Unlike a billboard — where dropping an empty slide just shortens the
 * carousel — a grid cell without artwork would leave a hole in a fixed shape,
 * so the whole row falls back rather than rendering partially.
 */
export const getBannerGridLayout = (
  row: PreparedPageRow,
): BannerGridLayout | null => {
  if (!isPageBuilderPresentationsEnabled()) {
    return null
  }

  const presentation = row.style?.[ROW_PRESENTATION_KEY]
  if (!isBannerGridPresentation(presentation)) {
    return null
  }

  const spec = BANNER_GRID_SPECS[presentation]
  const columns = row.columns ?? []
  if (columns.length !== spec.slotCount) {
    return null
  }

  const cells: BannerGridCell[] = []

  for (const [index, { widget, trackingId }] of columns.entries()) {
    if (!isBannerWidget(widget)) {
      return null
    }

    const media = widget.image
    const srcSet = bannerSrcSet(media)
    if (!media?.original && !srcSet) {
      return null
    }

    cells.push({
      id: widget.id,
      trackingId,
      media,
      srcSet,
      href: widget.href,
      openInNewTab: isBannerOpenInNewTab(widget.styles),
      ratio: spec.ratios[index],
    })
  }

  return {
    presentation,
    columns: spec.columns.map((slots) => slots.map((slot) => cells[slot])),
  }
}
