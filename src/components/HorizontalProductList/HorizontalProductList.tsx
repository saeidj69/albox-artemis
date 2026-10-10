'use client'

import type { FC } from 'react'

import { RiArrowLeftSLine } from '@remixicon/react'

import Animate from '@/components/Animate'
import AutoLink from '@/components/AutoLink'
import ProductCard from '@/components/ProductCard'
import VisibilityTracker from '@/components/VisibilityTracker'

import { Carousel, CarouselContent, CarouselItem } from '@/lib/Carousel'
import { cn } from '@/lib/utils'

import type { HorizontalProductListProps } from './types'
import { horizontalProductListVariants } from './variants'

const HorizontalProductListComponent: FC<HorizontalProductListProps> = (
  props,
) => {
  const {
    ref,
    title,
    products,
    titleHref,
    className,
    classNames,
    isLoading = false,
    skeletonCount = 10,
    showAddToCartPreview = false,
    headerBackdrop,
    headerAside,
    moreLinkContent,
    itemGap,
    onProductFullyVisible,
    onProductOpen,
    onProductFirstAdd,
    getProductKey,
    getProductTrackingId,
    ...rest
  } = props

  const slots = horizontalProductListVariants()

  const itemStyle = itemGap ? { paddingLeft: itemGap } : undefined

  const moreLink =
    titleHref && !isLoading ? (
      <AutoLink
        prefetch={false}
        href={titleHref}
        data-slot="horizontal-product-list-more-link"
        className={cn(slots.moreLink({ className: classNames?.moreLink }))}
      >
        {moreLinkContent ?? (
          <>
            مشاهده همه
            <RiArrowLeftSLine size={16} />
          </>
        )}
      </AutoLink>
    ) : null

  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <section
      ref={ref}
      data-slot="horizontal-product-list"
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...rest}
    >
      <div
        data-slot="horizontal-product-list-header"
        className={cn(slots.header({ className: classNames?.header }))}
      >
        {headerBackdrop ? (
          <div
            data-slot="horizontal-product-list-header-backdrop"
            className={cn(
              slots.headerBackdrop({ className: classNames?.headerBackdrop }),
            )}
          >
            {headerBackdrop}
          </div>
        ) : null}
        <div
          data-slot="horizontal-product-list-title"
          className={cn(slots.title({ className: classNames?.title }))}
        >
          {title}
        </div>

        {headerAside || moreLink ? (
          <div
            data-slot="horizontal-product-list-header-lead"
            className={cn(
              slots.headerLead({ className: classNames?.headerLead }),
            )}
          >
            {headerAside}
            {moreLink}
          </div>
        ) : null}
      </div>

      <Carousel
        data-slot="horizontal-product-list-carousel"
        className={slots.carousel({ className: classNames?.carousel })}
      >
        <CarouselContent
          data-slot="horizontal-product-list-carousel-content"
          className={slots.carouselContent({
            className: classNames?.carouselContent,
          })}
        >
          {isLoading &&
            Array.from({ length: skeletonCount }).map((_, index) => (
              <CarouselItem
                key={`product-skeleton-${index}`}
                data-slot="horizontal-product-list-item"
                className={slots.item({ className: classNames?.item })}
                style={itemStyle}
              >
                <ProductCard.Skeleton />
              </CarouselItem>
            ))}

          {!isLoading &&
            products?.map((product, index) => {
              const content = (
                <Animate animation="slideUp" delay={index * 50}>
                  <ProductCard
                    addToCartOptions={{
                      preview: showAddToCartPreview && index === 0,
                      onFirstAdd: onProductFirstAdd
                        ? () => onProductFirstAdd(product, index)
                        : undefined,
                    }}
                    product={product}
                    onProductOpen={
                      onProductOpen
                        ? () => onProductOpen(product, index)
                        : undefined
                    }
                  />
                </Animate>
              )

              const observableContent = onProductFullyVisible ? (
                <VisibilityTracker
                  threshold={1}
                  triggerOnce
                  onChange={(inView) => {
                    if (inView) onProductFullyVisible(product, index)
                  }}
                >
                  {content}
                </VisibilityTracker>
              ) : (
                content
              )

              return (
                <CarouselItem
                  key={getProductKey?.(product, index) ?? product.id}
                  data-slot="horizontal-product-list-item"
                  data-tracking-id={getProductTrackingId?.(product, index)}
                  className={slots.item({ className: classNames?.item })}
                  style={itemStyle}
                >
                  {observableContent}
                </CarouselItem>
              )
            })}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export default HorizontalProductListComponent
