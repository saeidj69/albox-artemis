import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingBannerHydratedWidget } from '@/api/models'

import type { PreparedPageRow } from '../hooks/use-home-data-populate'
import type { BannerGridLayout } from '../utils/banner-grid'
import type { BillboardSlide } from '../utils/row-presentation'
import { ROW_PRESENTATION } from '../utils/row-presentation'
import PreparedRowRenderer from './PreparedRowRenderer'

vi.mock('./widgets/BillboardWidget', () => ({
  default: ({ slides }: { slides: BillboardSlide[] }) => (
    <div data-testid="billboard">{slides.map(({ id }) => id).join(',')}</div>
  ),
}))
vi.mock('./widgets/BannerGridWidget', () => ({
  default: ({ layout }: { layout: BannerGridLayout }) => (
    <div data-testid="banner-grid" data-presentation={layout.presentation}>
      {layout.columns
        .map((column) => column.map((cell) => cell.id).join(','))
        .join('|')}
    </div>
  ),
}))
vi.mock('./widgets/BannerWidget', () => ({
  default: ({ widget }: { widget: ListingBannerHydratedWidget }) => (
    <div data-testid="banner-widget">{widget.id}</div>
  ),
}))
vi.mock('./widgets/BrandsRowWidget', () => ({ default: () => null }))
vi.mock('./widgets/CategoriesRowWidget', () => ({ default: () => null }))
vi.mock('./widgets/ProductsCartWidget', () => ({ default: () => null }))
vi.mock('./widgets/SurenaWidget', () => ({
  default: () => <div data-testid="surena-widget" />,
}))
vi.mock('./widgets/NmvWidget', () => ({
  default: () => <div data-testid="nmv-widget" />,
}))

const banner = (
  id: number,
  image: Partial<ListingBannerHydratedWidget['image']> = {},
): ListingBannerHydratedWidget => ({
  id,
  type: 'banner',
  image: {
    original: `banner-${id}.jpg`,
    metadata: {
      id: `media-${id}`,
      type: { value: 'image', label: 'تصویر' },
      originalMimeType: 'image/jpeg',
      originalFileName: `banner-${id}.jpg`,
      originalSize: 1,
    },
    ...image,
  },
  href: `/banner/${id}`,
  styles: {},
})

const row = (
  widgets: PreparedPageRow['columns'][number]['widget'][],
  style: Record<string, string> = {},
): PreparedPageRow => ({
  trackingId: 'row-0',
  position: 0,
  style,
  columns: widgets.map((widget) => ({
    trackingId: `banner-${'id' in widget ? widget.id : 'x'}`,
    widget,
    style: {},
  })),
})

const billboardStyle = { presentation: ROW_PRESENTATION.BILLBOARD }

describe('PreparedRowRenderer', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('stamps data-tracking-id on the row and each widget column', () => {
    const { container } = render(
      <PreparedRowRenderer row={row([banner(7), banner(9)])} index={0} />,
    )

    expect(
      container.querySelector('[data-slot="prepared-row"]'),
    ).toHaveAttribute('data-tracking-id', 'row-0')
    const columns = [
      ...container.querySelectorAll('[data-widget-type="banner"]'),
    ]
    expect(columns.map((c) => c.getAttribute('data-tracking-id'))).toEqual([
      'banner-7',
      'banner-9',
    ])
  })

  test('stamps the row id on the billboard branch band', () => {
    const { container } = render(
      <PreparedRowRenderer row={row([banner(2)], billboardStyle)} index={0} />,
    )

    expect(
      container.querySelector('[data-slot="prepared-row"]'),
    ).toHaveAttribute('data-tracking-id', 'row-0')
  })

  test('dispatches a marked banner row to the full-bleed billboard branch', () => {
    const { container } = render(
      <PreparedRowRenderer
        row={row([banner(2), banner(1)], billboardStyle)}
        index={0}
      />,
    )

    expect(screen.getByTestId('billboard')).toHaveTextContent('2,1')
    expect(screen.queryByTestId('banner-widget')).not.toBeInTheDocument()

    const preparedRow = container.querySelector('[data-slot="prepared-row"]')
    expect(preparedRow).toHaveClass('-mx-4')
    expect(preparedRow?.firstElementChild).not.toHaveClass('px-4')
  })

  test('falls back to ordinary rendering for a malformed marked row', () => {
    const { container } = render(
      <PreparedRowRenderer
        row={row([{ type: 'SURENA', surenaCode: 'code' }], billboardStyle)}
        index={0}
      />,
    )

    expect(screen.queryByTestId('billboard')).not.toBeInTheDocument()
    expect(screen.getByTestId('surena-widget')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="prepared-row"]')?.firstElementChild,
    ).toHaveClass('px-4')
  })

  test('renders the client NMV card in an ordinary row', () => {
    render(<PreparedRowRenderer row={row([{ type: 'NMV' }])} index={1} />)

    expect(screen.getByTestId('nmv-widget')).toBeInTheDocument()
  })

  test('falls back to ordinary rendering when no banner ships artwork', () => {
    const { container } = render(
      <PreparedRowRenderer
        row={row([banner(1, { lg: '', original: '' })], billboardStyle)}
        index={0}
      />,
    )

    expect(screen.queryByTestId('billboard')).not.toBeInTheDocument()
    expect(screen.getByTestId('banner-widget')).toHaveTextContent('1')
    expect(
      container.querySelector('[data-slot="prepared-row"]')?.firstElementChild,
    ).toHaveClass('px-4')
  })

  test('keeps unmarked side-by-side banners in the ordinary row branch', () => {
    const { container } = render(
      <PreparedRowRenderer row={row([banner(1), banner(2)])} index={0} />,
    )

    expect(screen.queryByTestId('billboard')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('banner-widget')).toHaveLength(2)
    expect(
      container.querySelector('[data-slot="prepared-row"]')?.firstElementChild,
    ).toHaveClass('px-4')
  })

  test('dispatches a marked banner row to the grid branch inside the gutter', () => {
    const { container } = render(
      <PreparedRowRenderer
        row={row([banner(1), banner(2), banner(3), banner(4)], {
          presentation: ROW_PRESENTATION.BANNER_GRID_MOSAIC,
        })}
        index={0}
      />,
    )

    const grid = screen.getByTestId('banner-grid')
    expect(grid).toHaveAttribute('data-presentation', 'banner_grid_mosaic')
    expect(grid).toHaveTextContent('1,3|2,4')
    expect(screen.queryByTestId('banner-widget')).not.toBeInTheDocument()

    // Grids stay inside the page gutter, unlike the full-bleed billboard.
    const preparedRow = container.querySelector('[data-slot="prepared-row"]')
    expect(preparedRow).toHaveClass('-mx-4')
    expect(preparedRow?.firstElementChild).toHaveClass('px-4')
  })

  test('drops the row gap on a grid row because the grid owns its gutters', () => {
    const { container } = render(
      <PreparedRowRenderer
        row={row([banner(1), banner(2)], {
          presentation: ROW_PRESENTATION.BANNER_GRID_DUO,
          gap: '24px',
          padding: '8px',
        })}
        index={0}
      />,
    )

    const content = container.querySelector(
      '[data-slot="prepared-row"]',
    )?.firstElementChild
    expect(content).toHaveStyle({ padding: '8px' })
    expect(content).not.toHaveStyle({ gap: '24px' })
  })

  test('falls back to ordinary rendering when a grid row has the wrong count', () => {
    render(
      <PreparedRowRenderer
        row={row([banner(1), banner(2)], {
          presentation: ROW_PRESENTATION.BANNER_GRID_QUAD,
        })}
        index={0}
      />,
    )

    expect(screen.queryByTestId('banner-grid')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('banner-widget')).toHaveLength(2)
  })
})
