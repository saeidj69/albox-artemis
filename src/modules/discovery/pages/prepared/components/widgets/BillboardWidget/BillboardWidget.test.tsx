import type { ComponentProps, ReactNode } from 'react'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { CarouselVariant } from '@/lib/Carousel'

import type { BillboardSlide } from '../../../utils/row-presentation'
import BillboardWidget from './BillboardWidget'

const carousel = vi.hoisted(() => ({
  props: [] as { variant?: CarouselVariant; opts?: Record<string, unknown> }[],
}))

// Embla cannot measure anything in jsdom, so the primitive is stubbed — but its
// props are captured, because "one slide per swipe, no wrap-around" lives in
// them and is exactly what must not regress.
vi.mock('@/lib/Carousel', () => ({
  Carousel: ({
    children,
    variant,
    opts,
  }: {
    children: ReactNode
    variant?: CarouselVariant
    opts?: Record<string, unknown>
  }) => {
    carousel.props.push({ variant, opts })
    return <div>{children}</div>
  },
  CarouselContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: ({ children, ...props }: ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
  CarouselDots: () => <div data-testid="billboard-dots" />,
}))

vi.mock('@/lib/AspectRatio', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/SmartImage', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // The production component delegates to next/image; this mock exposes order.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const slide = (
  id: number,
  href: string | null,
  openInNewTab = false,
): BillboardSlide => ({
  id,
  trackingId: `banner-${id}`,
  src: `banner-${id}.jpg`,
  href,
  openInNewTab,
})

describe('BillboardWidget', () => {
  beforeEach(() => {
    carousel.props = []
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('slides one page at a time without wrapping around', () => {
    render(<BillboardWidget slides={[slide(1, '/first'), slide(2, null)]} />)

    expect(carousel.props).toHaveLength(1)
    expect(carousel.props[0].variant).toBe('paged')
    expect(carousel.props[0].opts?.loop).not.toBe(true)
  })

  test('renders slides and independent destinations in authored order', () => {
    render(
      <BillboardWidget slides={[slide(2, '/second'), slide(1, '/first')]} />,
    )

    expect(
      screen.getAllByRole('img').map((image) => image.getAttribute('src')),
    ).toEqual(['banner-2.jpg', 'banner-1.jpg'])

    const links = screen.getAllByRole('link', { name: 'بنر تبلیغاتی' })
    expect(links[0]).toHaveAttribute('href', '/second')
    expect(links[1]).toHaveAttribute('href', '/first')
    expect(screen.getByTestId('billboard-dots')).toBeInTheDocument()
  })

  test('keeps an unlinked slide non-interactive', () => {
    render(<BillboardWidget slides={[slide(1, null), slide(2, '/second')]} />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/second')
  })

  test('opens a linked slide in a new tab when the flag is set', () => {
    render(
      <BillboardWidget
        slides={[slide(1, '/first', true), slide(2, '/second')]}
      />,
    )

    const links = screen.getAllByRole('link', { name: 'بنر تبلیغاتی' })
    expect(links[0]).toHaveAttribute('href', '/first')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
    expect(links[1]).toHaveAttribute('href', '/second')
    expect(links[1]).not.toHaveAttribute('target')
  })

  test('opens an off-app href in a new tab and keeps in-app hrefs in this tab', () => {
    vi.stubEnv('APP_URL', 'https://artemis.stage.all-box.ir')

    render(
      <BillboardWidget
        slides={[
          slide(1, 'https://other.example/promo'),
          slide(2, '/products/2'),
          slide(3, 'https://artemis.stage.all-box.ir/products/3'),
        ]}
      />,
    )

    const links = screen.getAllByRole('link', { name: 'بنر تبلیغاتی' })

    expect(links[0]).toHaveAttribute('href', 'https://other.example/promo')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')

    expect(links[1]).toHaveAttribute('href', '/products/2')
    expect(links[1]).not.toHaveAttribute('target')

    expect(links[2]).toHaveAttribute(
      'href',
      'https://artemis.stage.all-box.ir/products/3',
    )
    expect(links[2]).not.toHaveAttribute('target')
  })

  test('hides the indicator when there is nothing to page through', () => {
    render(<BillboardWidget slides={[slide(1, '/first')]} />)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'banner-1.jpg')
    expect(screen.queryByTestId('billboard-dots')).not.toBeInTheDocument()
  })
})
