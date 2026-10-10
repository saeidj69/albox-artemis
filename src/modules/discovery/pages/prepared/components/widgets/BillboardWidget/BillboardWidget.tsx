'use client'

import AutoLink from '@/components/AutoLink'
import SmartImage from '@/components/SmartImage'

import AspectRatio from '@/lib/AspectRatio'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/lib/Carousel'

import { bannerLinkTargetProps } from '../../../utils/banner-link'
import type { BillboardSlide } from '../../../utils/row-presentation'

/** Mobile artwork footprint from the design: 390x145. */
export const BILLBOARD_RATIO = 390 / 145

type BillboardWidgetProps = {
  slides: BillboardSlide[]
}

/**
 * Full-bleed banner strip. Slides reach the screen edge with square corners, so
 * the row band cancels the page gutter for it; the `paged` carousel variant
 * snaps one slide per release and stops at both ends instead of looping.
 *
 * Embla suppresses the click that ends a drag, so slide links need no guard.
 */
const BillboardWidget = (props: BillboardWidgetProps) => {
  const { slides } = props

  return (
    <section
      data-slot="prepared-billboard-widget"
      aria-label="بنرهای تبلیغاتی"
      className="w-full overflow-hidden"
    >
      <Carousel variant="paged" className="w-full">
        <CarouselContent classNames={{ track: 'ml-0' }}>
          {slides.map((slide, index) => {
            const content = (
              <AspectRatio
                ratio={BILLBOARD_RATIO}
                className="bg-background-secondary overflow-hidden"
              >
                <SmartImage
                  fill
                  alt="بنر تبلیغاتی"
                  src={slide.src}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  classNames={{ image: 'object-cover' }}
                  sizes="100vw"
                />
              </AspectRatio>
            )

            const slideClass =
              'block w-full overflow-hidden transition-transform duration-200 active:scale-[0.99]'

            return (
              <CarouselItem
                key={`${slide.id}-${slide.src}`}
                data-tracking-id={slide.trackingId}
                className="basis-full pl-0"
                aria-label={`${index + 1} از ${slides.length}`}
              >
                {slide.href ? (
                  <AutoLink
                    href={slide.href}
                    prefetch={false}
                    className={slideClass}
                    {...bannerLinkTargetProps(slide.openInNewTab)}
                  >
                    {content}
                  </AutoLink>
                ) : (
                  <div className={slideClass}>{content}</div>
                )}
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {slides.length > 1 ? (
          <CarouselDots
            className="bottom-2 gap-1.5 bg-transparent p-0 backdrop-blur-none"
            classNames={{ dot: 'bg-white/50', activeDot: 'w-4 bg-white' }}
          />
        ) : null}
      </Carousel>
    </section>
  )
}

export default BillboardWidget
