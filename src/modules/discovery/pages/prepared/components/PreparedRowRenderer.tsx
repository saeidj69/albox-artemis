'use client'

import type { CSSProperties } from 'react'

import type { ReadableTextColor } from '@/lib/utils'

import type {
  PreparedHomeWidget,
  PreparedPageRow,
} from '../hooks/use-home-data-populate'
import { getBannerGridLayout } from '../utils/banner-grid'
import {
  hasRowBandBackground,
  resolveRowBandBackground,
  resolveRowBandTextColor,
} from '../utils/row-background-presets'
import { getBillboardSlides } from '../utils/row-presentation'
import BannerGridWidget from './widgets/BannerGridWidget'
import BannerWidget from './widgets/BannerWidget'
import BillboardWidget from './widgets/BillboardWidget'
import BrandsRowWidget from './widgets/BrandsRowWidget'
import CategoriesRowWidget from './widgets/CategoriesRowWidget'
import NmvWidget from './widgets/NmvWidget'
import ProductsCartWidget from './widgets/ProductsCartWidget'
import SurenaWidget from './widgets/SurenaWidget'

type PreparedRowRendererProps = {
  row: PreparedPageRow
  index: number
}

/** Default vertical breathing room on painted bands without explicit padding. */
const PAINTED_BAND_VERTICAL_PADDING = '16px'

/**
 * The builder's row style bag is applied by copying known keys only — the
 * backend stores it without an allow-list, so spreading it verbatim could let
 * a stray key (display, position, ...) break the flex layout we own here.
 *
 * Explicit builder padding overrides the `px-4` gutter class entirely (inset
 * measured from the screen edge, matching the builder canvas). A painted band
 * with no explicit padding gets default vertical padding while `px-4` keeps
 * the horizontal gutter.
 *
 * `gap` only means something on the flex content box of an ordinary row, so
 * presentations that own their internal spacing opt out of it.
 */
const toContentStyle = (
  bag: Record<string, string>,
  hasRowBackground: boolean,
  options?: { withGap?: boolean },
): CSSProperties => {
  const style: CSSProperties = {}
  if (bag.padding) {
    style.padding = bag.padding
  } else if (hasRowBackground) {
    style.paddingTop = PAINTED_BAND_VERTICAL_PADDING
    style.paddingBottom = PAINTED_BAND_VERTICAL_PADDING
  }
  if (bag.gap && options?.withGap !== false) style.gap = bag.gap
  return style
}

type PreparedWidgetRendererProps = {
  widget: PreparedHomeWidget
  index: number
  trackingId: string
  /** Readable text color over the row band background; undefined = no band. */
  bandTextColor?: ReadableTextColor
}

const PreparedWidgetRenderer = (props: PreparedWidgetRendererProps) => {
  const { widget, index, trackingId, bandTextColor } = props

  switch (widget.type) {
    case 'banner':
      return (
        <BannerWidget widget={widget} trackingId={trackingId} index={index} />
      )

    case 'products_cart':
      return (
        <ProductsCartWidget
          widget={widget}
          trackingId={trackingId}
          index={index}
          bandTextColor={bandTextColor}
        />
      )

    case 'brands_showcase':
      return (
        <BrandsRowWidget
          widget={widget}
          index={index}
          bandTextColor={bandTextColor}
        />
      )

    case 'categories_showcase':
      return (
        <CategoriesRowWidget
          widget={widget}
          index={index}
          bandTextColor={bandTextColor}
        />
      )

    case 'SURENA':
      return <SurenaWidget surenaCode={widget.surenaCode} index={index} />

    case 'NMV':
      return <NmvWidget />

    default:
      return null
  }
}

/**
 * Every widget row renders inside a full-bleed band (`-mx-4` cancels the page
 * gutter) that carries the builder background, so widgets that intentionally
 * bleed to the screen edge (billboards, scrolling rows) stay inside the painted
 * area. The inner content box restores page alignment with `px-4`.
 */
const PreparedRowRenderer = (props: PreparedRowRendererProps) => {
  const { row, index } = props
  const columns = row.columns ?? []

  if (columns.length === 0) {
    return null
  }

  const bag = row.style ?? {}
  const bandBackground = resolveRowBandBackground(bag)
  const hasRowBackground = hasRowBandBackground(bag)

  // A billboard fills the band edge to edge, so the builder's padding and gap
  // (which only describe the inset content box) have nothing to apply to.
  const billboardSlides = getBillboardSlides(row)
  if (billboardSlides) {
    return (
      <div
        data-slot="prepared-row"
        data-tracking-id={row.trackingId}
        className="-mx-4"
        style={bandBackground}
      >
        <BillboardWidget slides={billboardSlides} />
      </div>
    )
  }

  // A grid keeps the page gutter and the builder's padding, but owns its own
  // gutters between cells, so the row's `gap` (a flex-only key) is dropped.
  const bannerGrid = getBannerGridLayout(row)
  if (bannerGrid) {
    return (
      <div
        data-slot="prepared-row"
        data-tracking-id={row.trackingId}
        className="-mx-4"
        style={bandBackground}
      >
        <div
          className="px-4"
          style={toContentStyle(bag, hasRowBackground, { withGap: false })}
        >
          <BannerGridWidget layout={bannerGrid} />
        </div>
      </div>
    )
  }

  const bandTextColor = resolveRowBandTextColor(bag)

  return (
    <div
      data-slot="prepared-row"
      data-tracking-id={row.trackingId}
      className="-mx-4"
      style={bandBackground}
    >
      <div className="flex px-4" style={toContentStyle(bag, hasRowBackground)}>
        {columns.map((column) => (
          <div
            key={column.trackingId}
            data-tracking-id={column.trackingId}
            data-widget-type={column.widget.type}
            className="min-w-0"
            style={{
              flexBasis: column.style?.flexBasis,
              flexGrow: 1,
              flexShrink: 1,
            }}
          >
            <PreparedWidgetRenderer
              widget={column.widget}
              trackingId={column.trackingId}
              index={index}
              bandTextColor={bandTextColor}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PreparedRowRenderer
