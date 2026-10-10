import type { ReactNode } from 'react'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { Media } from '@/api/models'

import type { BannerGridLayout } from '../../../utils/banner-grid'
import { getBannerGridLayout } from '../../../utils/banner-grid'
import { ROW_PRESENTATION } from '../../../utils/row-presentation'
import BannerGridWidget from './BannerGridWidget'

vi.mock('@/lib/AspectRatio', () => ({
  default: ({ ratio, children }: { ratio: number; children: ReactNode }) => (
    <div data-testid="aspect-ratio" data-ratio={ratio}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/SmartImage', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // The production component delegates to next/image; this mock exposes order.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const media = (id: number): Media => ({
  original: `banner-${id}.jpg`,
  metadata: {
    id: `media-${id}`,
    type: { value: 'image', label: 'تصویر' },
    originalMimeType: 'image/jpeg',
    originalFileName: `banner-${id}.jpg`,
    originalSize: 1,
  },
})

const layout = (
  presentation: BannerGridLayout['presentation'],
  hrefs: (string | null)[],
  styleByIndex: Record<string, string>[] = [],
): BannerGridLayout =>
  getBannerGridLayout({
    trackingId: 'row-0',
    position: 0,
    style: { presentation },
    columns: hrefs.map((href, index) => ({
      trackingId: `banner-${index + 1}`,
      widget: {
        id: index + 1,
        type: 'banner',
        image: media(index + 1),
        href,
        styles: styleByIndex[index] ?? {},
      },
      style: {},
    })),
  })!

describe('BannerGridWidget', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('renders slots in RTL reading order across two columns', () => {
    const { container } = render(
      <BannerGridWidget
        layout={layout(ROW_PRESENTATION.BANNER_GRID_QUAD, [
          '/one',
          '/two',
          '/three',
          '/four',
        ])}
      />,
    )

    const columns = container.querySelectorAll(
      '[data-slot="prepared-banner-grid-column"]',
    )
    expect(columns).toHaveLength(2)

    // Slot 1 heads the first (rightmost) column, slot 2 heads the second.
    const srcPerColumn = [...columns].map((column) =>
      [...column.querySelectorAll('img')].map((image) =>
        image.getAttribute('src'),
      ),
    )
    expect(srcPerColumn).toEqual([
      ['banner-1.jpg', 'banner-3.jpg'],
      ['banner-2.jpg', 'banner-4.jpg'],
    ])
  })

  test('locks each mosaic cell to the aspect ratio of its slot', () => {
    render(
      <BannerGridWidget
        layout={layout(ROW_PRESENTATION.BANNER_GRID_MOSAIC, [
          null,
          null,
          null,
          null,
        ])}
      />,
    )

    expect(
      screen
        .getAllByTestId('aspect-ratio')
        .map((cell) => Number(cell.getAttribute('data-ratio'))),
    ).toEqual([169 / 169, 169 / 92, 169 / 92, 169 / 169])
  })

  test('links only the slots that carry a destination', () => {
    render(
      <BannerGridWidget
        layout={layout(ROW_PRESENTATION.BANNER_GRID_DUO, ['/first', null])}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/first')
    expect(links[0]).not.toHaveAttribute('target')
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})
