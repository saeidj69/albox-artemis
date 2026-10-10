'use client'

import { FC } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Animate from '@/components/Animate'
import CategoryCard from '@/components/CategoryCard'

import type { ListingCategoriesShowcaseHydratedWidget } from '@/api/models'

import { Carousel, CarouselContent, CarouselItem } from '@/lib/Carousel'
import { readableTextClass, type ReadableTextColor } from '@/lib/utils'

interface CategoriesRowWidgetProps {
  index: number
  widget: ListingCategoriesShowcaseHydratedWidget
  /** Readable text color over the row band background; undefined = no band. */
  bandTextColor?: ReadableTextColor
}

const CategoriesRowWidgetComponent: FC<CategoriesRowWidgetProps> = (props) => {
  const { widget, bandTextColor } = props

  const { categories } = widget

  if (categories.length === 0) {
    return null
  }

  const titleClass = readableTextClass(bandTextColor)

  return (
    <section data-slot="prepared-categories-row">
      <Carousel className="-mx-4">
        <CarouselContent className="px-4">
          {categories.map((category, index) => (
            <CarouselItem
              key={category.id}
              className="basis-[calc(100%/3-16px)]"
            >
              <Animate animation="slideUp" delay={index * 50}>
                <Link
                  href={ROUTES.CATEGORIES.detail(category.id)}
                  prefetch={false}
                  className="block w-full"
                >
                  <CategoryCard
                    category={category}
                    classNames={titleClass ? { title: titleClass } : undefined}
                  />
                </Link>
              </Animate>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export default CategoriesRowWidgetComponent
