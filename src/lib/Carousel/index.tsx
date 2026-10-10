'use client'

import * as React from 'react'

import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react'
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { Slot } from 'radix-ui'

import Button from '@/lib/Button'
import { cn } from '@/lib/utils'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselVariant = 'native' | 'enhanced' | 'paged'

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  variant?: CarouselVariant
  setApi?: (api: CarouselApi) => void
}

/**
 * Embla options per variant. `native` and `enhanced` share the free-scrolling
 * profile used by product/category rows: a fast swipe may skip snap points, and
 * from 520px the track scrolls freely under the cursor.
 *
 * `paged` shows one full-bleed slide at a time, so it snaps to a slide on every
 * release at every width and stops hard at both ends.
 */
const VARIANT_OPTIONS: Record<CarouselVariant, NonNullable<CarouselOptions>> = {
  native: {
    skipSnaps: true,
    breakpoints: { '(min-width: 520px)': { active: true, dragFree: true } },
  },
  enhanced: {
    skipSnaps: true,
    breakpoints: { '(min-width: 520px)': { active: true, dragFree: true } },
  },
  paged: {
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    loop: false,
  },
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  currentIndex: number
  total: number
  variant: CarouselVariant
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function Carousel({
  opts,
  setApi,
  plugins,
  children,
  className,
  variant = 'native',
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const emblaPlugins = React.useMemo(() => {
    const wheel = WheelGesturesPlugin({ forceWheelAxis: 'x' })
    return plugins ? [...plugins, wheel] : [wheel]
  }, [plugins])

  const [carouselRef, api] = useEmblaCarousel(
    {
      direction: 'rtl',
      axis: 'x',
      align: 'start',
      ...VARIANT_OPTIONS[variant],
      ...opts,
      active: variant !== 'native',
      breakpoints: {
        ...VARIANT_OPTIONS[variant].breakpoints,
        ...opts?.breakpoints,
      },
    },
    emblaPlugins,
  )

  const [total, setTotal] = React.useState(0)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setCurrentIndex(api.selectedScrollSnap())
    setTotal(api.slideNodes().length)
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return

    queueMicrotask(() => {
      onSelect(api)
    })

    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        variant,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        currentIndex,
        total,
      }}
    >
      <div
        role="region"
        data-slot="carousel"
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  classNames,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  classNames?: { track?: string }
}) {
  const { carouselRef, variant } = useCarousel()

  return (
    <div
      ref={carouselRef}
      data-slot="carousel-content"
      className={cn(
        variant === 'native'
          ? 'scrollbar-hide overflow-x-auto overflow-y-hidden max-[519px]:snap-x max-[519px]:snap-mandatory min-[520px]:cursor-grab min-[520px]:overflow-hidden min-[520px]:overscroll-x-none min-[520px]:active:cursor-grabbing'
          : 'overflow-hidden overscroll-x-none min-[520px]:cursor-grab min-[520px]:active:cursor-grabbing',
        // Edge gutters belong on the viewport so Embla trims scroll to slides
        // while start/end insets stay visible (padding on the track is ignored).
        className,
      )}
      {...props}
    >
      <div
        data-slot="carousel-track"
        className={cn('-ml-4 flex', classNames?.track)}
      >
        {children}
      </div>
    </div>
  )
}

function CarouselItem({
  className,
  asChild,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = (asChild ? Slot.Root : 'div') as React.ElementType

  return (
    <Comp
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn('block min-w-0 shrink-0 grow-0 basis-full pl-4', className)}
      {...props}
    />
  )
}

const CarouselDots = ({
  className,
  classNames,
  ...props
}: React.ComponentProps<'div'> & {
  classNames?: { dot?: string; activeDot?: string }
}) => {
  const { total, currentIndex } = useCarousel()

  if (total < 2) {
    return null
  }

  return (
    <div
      data-slot="carousel-dots"
      className={cn(
        'rounded-full bg-black/20 p-1.5 backdrop-blur-2xl',
        'absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2',
        className,
      )}
      {...props}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = currentIndex === index

        return (
          <div
            key={index}
            data-slot="carousel-dot"
            data-active={isActive || undefined}
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-white/40 transition-all',
              classNames?.dot,
              isActive && 'w-4 bg-white',
              isActive && classNames?.activeDot,
            )}
          />
        )
      })}
    </div>
  )
}

function CarouselNext({
  className,
  variant = 'ghost',
  size = 'small',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        'absolute top-1/2 -right-12 size-8 -translate-y-1/2 rounded-full',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <RiArrowRightLine />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

function CarouselPrevious({
  className,
  variant = 'ghost',
  size = 'small',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        'absolute top-1/2 -left-12 size-8 -translate-y-1/2 rounded-full',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <RiArrowLeftLine />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  type CarouselVariant,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
}
