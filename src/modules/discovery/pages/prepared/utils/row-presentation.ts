import { isPageBuilderPresentationsEnabled } from '@/constants/feature-flags'

import type { PreparedPageRow } from '../hooks/use-home-data-populate'
import { isBannerOpenInNewTab } from './banner-link'
import { isBannerWidget, toBannerSource } from './banner-media'

/** Style-bag key set by the admin page builder. */
export const ROW_PRESENTATION_KEY = 'presentation'

/** Row presentations the storefront knows how to render. */
export const ROW_PRESENTATION = {
  /** Full-bleed, square-cornered banner strip; multiple banners slide. */
  BILLBOARD: 'billboard',
  /** Two interlocking columns of one square and one wide banner each. */
  BANNER_GRID_MOSAIC: 'banner_grid_mosaic',
  /** Two rows of two equally wide banners. */
  BANNER_GRID_QUAD: 'banner_grid_quad',
  /** A single row of two banners. */
  BANNER_GRID_DUO: 'banner_grid_duo',
} as const

export type RowPresentation =
  (typeof ROW_PRESENTATION)[keyof typeof ROW_PRESENTATION]

export type BillboardSlide = {
  id: number
  trackingId: string
  src: string
  href: string | null
  openInNewTab: boolean
}

export const isBillboardRow = (style?: Record<string, string>): boolean =>
  style?.[ROW_PRESENTATION_KEY] === ROW_PRESENTATION.BILLBOARD

/**
 * Slides for a full-bleed billboard row, or null when the row must render as an
 * ordinary column row instead: unmarked by the builder, empty, mixing in a
 * non-banner widget, or carrying no usable artwork.
 *
 * Owning all four rules here keeps the renderer's branch condition and the
 * widget's data from drifting apart.
 */
export const getBillboardSlides = (
  row: PreparedPageRow,
): BillboardSlide[] | null => {
  if (!isPageBuilderPresentationsEnabled()) {
    return null
  }

  if (!isBillboardRow(row.style) || row.columns.length === 0) {
    return null
  }

  const slides: BillboardSlide[] = []

  for (const { widget, trackingId } of row.columns) {
    if (!isBannerWidget(widget)) {
      return null
    }

    const src = toBannerSource(widget)
    if (src) {
      slides.push({
        id: widget.id,
        trackingId,
        src,
        href: widget.href,
        openInNewTab: isBannerOpenInNewTab(widget.styles),
      })
    }
  }

  return slides.length > 0 ? slides : null
}
