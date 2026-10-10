'use client'

import type { ComponentProps } from 'react'

import CategoryCard from '@/components/CategoryCard'

import { Carousel, CarouselContent, CarouselItem } from '@/lib/Carousel'
import { cn } from '@/lib/utils'

type CategoriesRowWidgetSkeletonProps = ComponentProps<'section'>

const CategoriesRowWidgetSkeleton = (
  props: CategoriesRowWidgetSkeletonProps,
) => {
  const { className, ...rest } = props

  return (
    <section
      data-slot="prepared-categories-row-skeleton"
      className={cn(className)}
      {...rest}
    >
      <Carousel className="-mx-4">
        <CarouselContent className="px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <CarouselItem
              key={`sk-${index}`}
              className="basis-[calc(100%/3-16px)]"
            >
              <CategoryCard.Skeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export default CategoriesRowWidgetSkeleton
