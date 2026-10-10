'use client'

import { useEffect, useMemo, useState } from 'react'

import AutoLink from '@/components/AutoLink'
import SmartImage from '@/components/SmartImage'

import type { ListingBannerHydratedWidget, Media } from '@/api/models'

import AspectRatio from '@/lib/AspectRatio'
import type { CarouselApi } from '@/lib/Carousel'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/lib/Carousel'
import { cn } from '@/lib/utils'

import { bannerSrcSet } from '../../../utils/banner-media'
import { childTrackingId } from '../../../utils/tracking-ids'

const AUTOPLAY_INTERVAL_MS = 5500

/**
 * Aspect ratio used when the builder didn't set `styles.ratio` on the banner.
 * Matches the classic home banner artwork (358x102.55).
 */
export const DEFAULT_BANNER_RATIO = 358 / 102.55

type BannerWidgetProps = {
  widget: ListingBannerHydratedWidget
  /** Tracking id of the widget; each slide derives its own from it. */
  trackingId: string
  index: number
}

type BannerSlide = {
  key: string
  media: Media
  srcSet: string
  ratio: number
}

const toSlides = (widget: ListingBannerHydratedWidget): BannerSlide[] => {
  const media = widget.image

  const srcSet = bannerSrcSet(media)

  if (!media.original && !srcSet) {
    return []
  }

  const parsedRatio = Number(widget?.styles?.ratio)

  return [
    {
      srcSet,
      media,
      key: String(media.original),
      ratio:
        Number.isFinite(parsedRatio) && parsedRatio > 0
          ? parsedRatio
          : DEFAULT_BANNER_RATIO,
    },
  ]
}

const BannerWidget = (props: BannerWidgetProps) => {
  const { widget, trackingId } = props

  const slides = useMemo(() => toSlides(widget), [widget])

  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>(
    undefined,
  )

  useEffect(() => {
    if (!carouselApi || slides.length < 2) {
      return
    }

    const id = window.setInterval(() => {
      carouselApi.scrollNext()
    }, AUTOPLAY_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [carouselApi, slides.length])

  if (slides.length === 0) {
    return null
  }

  const loop = slides.length > 1

  return (
    <section data-slot="prepared-banner-widget">
      <div className="relative">
        <Carousel
          variant="enhanced"
          setApi={setCarouselApi}
          opts={{ loop, align: 'start' }}
          className="w-app"
        >
          <CarouselContent>
            {slides.map((slide, slideIndex) => {
              const content = (
                <AspectRatio
                  ratio={slide.ratio}
                  className="bg-background-secondary rounded-brand overflow-hidden"
                >
                  <SmartImage
                    fill
                    alt="بنر"
                    src={slide.media.original}
                    sources={
                      slide.srcSet
                        ? [
                            {
                              type: 'image/webp',
                              srcSet: slide.srcSet,
                              sizes: 'min(100vw, 448px)',
                            },
                          ]
                        : undefined
                    }
                    loading="eager"
                    classNames={{
                      image: 'object-contain',
                    }}
                    sizes="min(100vw, 448px)"
                  />
                </AspectRatio>
              )

              const wrapperClass = cn(
                'rounded-brand block w-full overflow-hidden',
                'transition-transform duration-200 active:scale-95',
              )

              const slideTrackingId = childTrackingId(
                trackingId,
                'slide',
                slideIndex,
              )

              if (widget.href) {
                return (
                  <CarouselItem
                    key={slide.key}
                    data-tracking-id={slideTrackingId}
                    className="basis-full"
                  >
                    <AutoLink
                      href={widget.href}
                      prefetch={false}
                      className={wrapperClass}
                    >
                      {content}
                    </AutoLink>
                  </CarouselItem>
                )
              }

              return (
                <CarouselItem
                  key={slide.key}
                  data-tracking-id={slideTrackingId}
                  className="basis-full"
                >
                  <div className={wrapperClass}>{content}</div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselDots />
        </Carousel>
      </div>
    </section>
  )
}

export default BannerWidget
