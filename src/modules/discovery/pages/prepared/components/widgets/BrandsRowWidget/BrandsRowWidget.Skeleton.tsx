'use client'

import type { ComponentProps } from 'react'

import BrandCard from '@/components/BrandCard'

import { cn } from '@/lib/utils'

const SKELETON_COUNT = 8

type BrandsRowWidgetSkeletonProps = ComponentProps<'section'>

const BrandsRowWidgetSkeleton = (props: BrandsRowWidgetSkeletonProps) => {
  const { className, ...rest } = props

  return (
    <section
      data-slot="prepared-brands-row-skeleton"
      className={cn(className)}
      {...rest}
    >
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <BrandCard.Skeleton key={`sk-${index}`} />
        ))}
      </div>
    </section>
  )
}

export default BrandsRowWidgetSkeleton
