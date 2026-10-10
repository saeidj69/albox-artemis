'use client'

import type { ComponentProps } from 'react'

import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { BILLBOARD_RATIO } from './BillboardWidget'

type BillboardWidgetSkeletonProps = ComponentProps<'section'>

/** Holds the widget's full-bleed footprint: `-mx-4` cancels the page gutter. */
const BillboardWidgetSkeleton = (props: BillboardWidgetSkeletonProps) => {
  const { className, ...rest } = props

  return (
    <section
      data-slot="prepared-billboard-widget-skeleton"
      aria-hidden="true"
      className={cn('-mx-4 overflow-hidden', className)}
      {...rest}
    >
      <AspectRatio
        ratio={BILLBOARD_RATIO}
        className="bg-background-secondary overflow-hidden"
      >
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      </AspectRatio>
    </section>
  )
}

export default BillboardWidgetSkeleton
