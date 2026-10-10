'use client'

import type { ComponentProps } from 'react'

import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { BannerGridPresentation } from '../../../utils/banner-grid'
import { BANNER_GRID_SPECS } from '../../../utils/banner-grid'
import { ROW_PRESENTATION } from '../../../utils/row-presentation'
import { BANNER_GRID_GAP_CLASS } from './BannerGridWidget'

type BannerGridWidgetSkeletonProps = ComponentProps<'section'> & {
  presentation?: BannerGridPresentation
}

/** Holds the grid's exact footprint so the page does not shift when it loads. */
const BannerGridWidgetSkeleton = (props: BannerGridWidgetSkeletonProps) => {
  const {
    presentation = ROW_PRESENTATION.BANNER_GRID_QUAD,
    className,
    ...rest
  } = props

  const spec = BANNER_GRID_SPECS[presentation]

  return (
    <section
      data-slot="prepared-banner-grid-widget-skeleton"
      aria-hidden="true"
      className={cn(
        'flex w-full items-start',
        BANNER_GRID_GAP_CLASS,
        className,
      )}
      {...rest}
    >
      {spec.columns.map((slots, columnIndex) => (
        <div
          key={columnIndex}
          className={cn('flex min-w-0 flex-1 flex-col', BANNER_GRID_GAP_CLASS)}
        >
          {slots.map((slot) => (
            <AspectRatio
              key={slot}
              ratio={spec.ratios[slot]}
              className="bg-background-secondary overflow-hidden rounded-2xl"
            >
              <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />
            </AspectRatio>
          ))}
        </div>
      ))}
    </section>
  )
}

export default BannerGridWidgetSkeleton
