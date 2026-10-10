'use client'

import type { ComponentProps } from 'react'

import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { DEFAULT_BANNER_RATIO } from './BannerWidget'

type BannerWidgetSkeletonProps = ComponentProps<'section'>

const BannerWidgetSkeleton = (props: BannerWidgetSkeletonProps) => {
  const { className, ...rest } = props

  return (
    <section
      data-slot="prepared-banner-widget-skeleton"
      className={cn('w-app', className)}
      {...rest}
    >
      <div className="rounded-brand block w-full overflow-hidden">
        <AspectRatio
          ratio={DEFAULT_BANNER_RATIO}
          className="bg-background-secondary rounded-brand overflow-hidden"
        >
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        </AspectRatio>
      </div>
    </section>
  )
}

export default BannerWidgetSkeleton
