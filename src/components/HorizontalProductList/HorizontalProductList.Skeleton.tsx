import type { FC } from 'react'

import ProductCard from '@/components/ProductCard'

import { Carousel, CarouselContent, CarouselItem } from '@/lib/Carousel'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { HorizontalProductListSkeletonProps } from './types'
import { horizontalProductListSkeletonVariants } from './variants'

const HorizontalProductListSkeletonComponent: FC<
  HorizontalProductListSkeletonProps
> = (props) => {
  const { className, classNames, skeletonCount = 10, ref, ...rest } = props

  const slots = horizontalProductListSkeletonVariants()

  return (
    <section
      ref={ref}
      data-slot="horizontal-product-list-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <header
        data-slot="horizontal-product-list-skeleton-header"
        className={slots.header({ className: classNames?.header })}
      >
        <Skeleton
          data-slot="horizontal-product-list-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />
        <Skeleton
          data-slot="horizontal-product-list-skeleton-more-link"
          className={slots.moreLink({ className: classNames?.moreLink })}
        />
      </header>

      <Carousel
        data-slot="horizontal-product-list-skeleton-carousel"
        className={slots.carousel({ className: classNames?.carousel })}
      >
        <CarouselContent
          data-slot="horizontal-product-list-skeleton-carousel-content"
          className={slots.carouselContent({
            className: classNames?.carouselContent,
          })}
        >
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <CarouselItem
              key={`product-skeleton-${index}`}
              data-slot="horizontal-product-list-skeleton-item"
              className={slots.item({ className: classNames?.item })}
            >
              <ProductCard.Skeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export default HorizontalProductListSkeletonComponent
