'use client'

import AutoLink from '@/components/AutoLink'
import SmartImage from '@/components/SmartImage'

import AspectRatio from '@/lib/AspectRatio'

import type {
  BannerGridCell,
  BannerGridLayout,
} from '../../../utils/banner-grid'

/** Gutter between columns and between stacked cells, from the design. */
export const BANNER_GRID_GAP_CLASS = 'gap-3'

/** Each cell spans half the content box minus half the 12px gutter. */
const CELL_SIZES = '(min-width: 448px) 218px, calc(50vw - 22px)'

type BannerGridWidgetProps = {
  layout: BannerGridLayout
}

const BannerGridCellView = (props: {
  cell: BannerGridCell
  eager: boolean
}) => {
  const { cell, eager } = props

  const content = (
    <AspectRatio
      ratio={cell.ratio}
      className="bg-background-secondary overflow-hidden rounded-2xl"
    >
      <SmartImage
        fill
        alt="بنر"
        src={cell.media.original}
        sources={
          cell.srcSet
            ? [{ type: 'image/webp', srcSet: cell.srcSet, sizes: CELL_SIZES }]
            : undefined
        }
        loading={eager ? 'eager' : 'lazy'}
        classNames={{ image: 'object-cover' }}
        sizes={CELL_SIZES}
      />
    </AspectRatio>
  )

  const cellClass =
    'block w-full overflow-hidden rounded-2xl transition-transform duration-200 active:scale-[0.98]'

  return (
    <div
      data-slot="prepared-banner-grid-cell"
      data-tracking-id={cell.trackingId}
    >
      {cell.href ? (
        <AutoLink href={cell.href} prefetch={false} className={cellClass}>
          {content}
        </AutoLink>
      ) : (
        <div className={cellClass}>{content}</div>
      )}
    </div>
  )
}

/**
 * Fixed banner mosaics: two equal-width columns of stacked cells, each cell
 * locked to the aspect ratio its slot carries in the layout spec. The columns
 * flow with the document direction, so the first one lands on the right in RTL
 * and slots read 1..n from top-right to bottom-left.
 */
const BannerGridWidget = (props: BannerGridWidgetProps) => {
  const { layout } = props

  return (
    <section
      data-slot="prepared-banner-grid-widget"
      data-presentation={layout.presentation}
      aria-label="بنرها"
      className={`flex w-full items-start ${BANNER_GRID_GAP_CLASS}`}
    >
      {layout.columns.map((cells, columnIndex) => (
        <div
          key={cells.map((cell) => cell.id).join('-')}
          data-slot="prepared-banner-grid-column"
          className={`flex min-w-0 flex-1 flex-col ${BANNER_GRID_GAP_CLASS}`}
        >
          {cells.map((cell, cellIndex) => (
            <BannerGridCellView
              key={cell.id}
              cell={cell}
              eager={columnIndex === 0 && cellIndex === 0}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

export default BannerGridWidget
