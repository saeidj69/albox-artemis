import type { ReactNode } from 'react'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BrandsList from './brands-list'

const useListBrandsListingInfinite = vi.fn()
const usePreparedPageRows = vi.fn()

let location = { latitude: 35.7, longitude: 51.4 }
let isLocationLoading = false

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({ location, isLoading: isLocationLoading }),
}))

vi.mock('@/api/functions/catalogue', () => ({
  useListBrandsListingInfinite: (...args: unknown[]) =>
    useListBrandsListingInfinite(...args),
}))

vi.mock('@/modules/discovery/hooks/use-prepared-page-rows', () => ({
  usePreparedPageRows: (...args: unknown[]) => usePreparedPageRows(...args),
}))

vi.mock('@/modules/discovery/components/PreparedWidgetRow', () => ({
  default: ({ row }: { row: { position: number } }) => (
    <div data-testid="widget-row">widget@{row.position}</div>
  ),
}))

// Render the grid inline so the interleaved order is observable; the real
// FlatList only adds skeleton/infinite-scroll plumbing this test doesn't own.
type FlatListMockProps = {
  data?: unknown[]
  loading?: boolean
  renderItem: (item: unknown, index: number, length: number) => ReactNode
}

vi.mock('@/lib/FlatList', () => ({
  default: ({ data = [], loading, renderItem }: FlatListMockProps) =>
    loading ? (
      <div data-testid="skeletons" />
    ) : (
      <>
        {data.map((item, index) => (
          <div key={index}>{renderItem(item, index, data.length)}</div>
        ))}
      </>
    ),
}))

const brandPage = (ids: number[]) => ({
  data: {
    brands: ids.map((id) => ({ id, name: `brand-${id}` })),
    hasMore: false,
  },
  isLoading: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
})

describe('BrandsList', () => {
  beforeEach(() => {
    location = { latitude: 35.7, longitude: 51.4 }
    isLocationLoading = false
    useListBrandsListingInfinite.mockReset()
    useListBrandsListingInfinite.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    })
    usePreparedPageRows.mockReset()
    usePreparedPageRows.mockReturnValue({ rows: [], isLoading: false })
  })

  test('lists brands for the resolved location', () => {
    render(<BrandsList />)

    expect(useListBrandsListingInfinite).toHaveBeenCalledWith(
      {
        limit: 48,
        latitude: 35.7,
        longitude: 51.4,
      },
      expect.objectContaining({
        query: expect.objectContaining({ enabled: true }),
      }),
    )
  })

  test('keeps the brand request disabled until location resolution finishes', () => {
    isLocationLoading = true

    render(<BrandsList />)

    expect(useListBrandsListingInfinite).toHaveBeenCalledWith(
      expect.objectContaining(location),
      expect.objectContaining({
        query: expect.objectContaining({ enabled: false }),
      }),
    )
  })

  test('renders the grid unchanged when no CMS page exists at the path', () => {
    useListBrandsListingInfinite.mockReturnValue(brandPage([1, 2, 3]))

    render(<BrandsList />)

    expect(usePreparedPageRows).toHaveBeenCalledWith('brands')
    expect(screen.queryByTestId('widget-row')).not.toBeInTheDocument()
    expect(screen.getByText('brand-1')).toBeInTheDocument()
  })

  test('weaves builder rows between the brand rows without replacing them', () => {
    useListBrandsListingInfinite.mockReturnValue(
      brandPage([1, 2, 3, 4, 5, 6, 7]),
    )
    usePreparedPageRows.mockReturnValue({
      rows: [{ position: 2, style: {}, columns: [] }],
      isLoading: false,
    })

    const { container } = render(<BrandsList />)

    // Every brand survives; the widget sits after two rows of three.
    expect(screen.getAllByText(/^brand-\d$/)).toHaveLength(7)
    const rendered = Array.from(
      container.querySelectorAll('[data-testid="widget-row"], a'),
    ).map((node) =>
      node.getAttribute('data-testid') === 'widget-row'
        ? 'widget'
        : node.textContent,
    )
    expect(rendered).toEqual([
      'brand-1',
      'brand-2',
      'brand-3',
      'brand-4',
      'brand-5',
      'brand-6',
      'widget',
      'brand-7',
    ])
  })

  test('renders rows anchored at the top above the grid', () => {
    useListBrandsListingInfinite.mockReturnValue(brandPage([1, 2]))
    usePreparedPageRows.mockReturnValue({
      rows: [{ position: 0, style: {}, columns: [] }],
      isLoading: false,
    })

    render(<BrandsList />)

    expect(screen.getByTestId('widget-row')).toHaveTextContent('widget@0')
    expect(screen.getByText('brand-1')).toBeInTheDocument()
  })
})
