import type { ReactNode } from 'react'

import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import { Carousel, CarouselContent, CarouselItem } from '@/lib/Carousel'

const useEmblaCarousel = vi.hoisted(() =>
  vi.fn<
    (
      options?: unknown,
      plugins?: unknown,
    ) => readonly [ReturnType<typeof vi.fn>, undefined]
  >(() => [vi.fn(), undefined] as const),
)

vi.mock('embla-carousel-react', () => ({
  default: useEmblaCarousel,
}))

vi.mock('embla-carousel-wheel-gestures', () => ({
  WheelGesturesPlugin: vi.fn((options: unknown) => ({
    name: 'wheelGestures',
    options,
  })),
}))

vi.mock('@/lib/Button', () => ({
  default: ({ children, ...props }: { children: ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))

describe('Carousel desktop free-drag', () => {
  test('enables Embla with dragFree at 520px and attaches wheel gestures', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>one</CarouselItem>
          <CarouselItem>two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )

    expect(useEmblaCarousel).toHaveBeenCalled()
    const [opts, plugins] = useEmblaCarousel.mock.lastCall ?? [
      undefined,
      undefined,
    ]

    expect(opts).toMatchObject({
      direction: 'rtl',
      axis: 'x',
      align: 'start',
      skipSnaps: true,
      active: false,
      breakpoints: {
        '(min-width: 520px)': {
          active: true,
          dragFree: true,
        },
      },
    })

    expect(WheelGesturesPlugin).toHaveBeenCalledWith({ forceWheelAxis: 'x' })
    expect(plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'wheelGestures' }),
      ]),
    )
  })

  test('keeps enhanced variant active on mobile while still free-dragging on desktop', () => {
    render(
      <Carousel variant="enhanced">
        <CarouselContent>
          <CarouselItem>slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )

    const [opts] = useEmblaCarousel.mock.lastCall ?? [undefined]

    expect(opts).toMatchObject({
      active: true,
      breakpoints: {
        '(min-width: 520px)': {
          active: true,
          dragFree: true,
        },
      },
    })
  })

  test('aligns native overflow hide with the 520px Embla breakpoint', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>one</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )

    const content = container.querySelector('[data-slot="carousel-content"]')
    expect(content?.className).toContain('min-[520px]:overflow-hidden')
    expect(content?.className).toContain('min-[520px]:cursor-grab')
    expect(content?.className).toContain('max-[519px]:snap-x')
    expect(content?.className).not.toContain('md:overflow-hidden')
    expect(content?.className).not.toMatch(/(?:^|\s)snap-x(?:\s|$)/)
  })

  test('puts caller className on the Embla viewport for edge gutters', () => {
    const { container } = render(
      <Carousel>
        <CarouselContent className="px-4">
          <CarouselItem>one</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )

    const content = container.querySelector('[data-slot="carousel-content"]')
    expect(content?.className).toContain('px-4')
    expect(content?.querySelector('.-ml-4')?.className).not.toContain('px-4')
  })
})

describe('Carousel paged variant', () => {
  const renderPaged = (opts?: Record<string, unknown>) => {
    render(
      <Carousel variant="paged" opts={opts}>
        <CarouselContent>
          <CarouselItem>one</CarouselItem>
          <CarouselItem>two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )

    return useEmblaCarousel.mock.calls.at(-1)?.[0]
  }

  test('snaps one slide per release and stops hard at both ends', () => {
    expect(renderPaged()).toMatchObject({
      direction: 'rtl',
      active: true,
      loop: false,
      dragFree: false,
      skipSnaps: false,
      containScroll: 'trimSnaps',
      // No 520px override, so a desktop viewport keeps snapping too.
      breakpoints: {},
    })
  })

  test('still lets the caller override a variant default', () => {
    expect(renderPaged({ align: 'center', skipSnaps: true })).toMatchObject({
      align: 'center',
      skipSnaps: true,
      containScroll: 'trimSnaps',
    })
  })
})
