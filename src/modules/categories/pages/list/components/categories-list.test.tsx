import type { ReactNode } from 'react'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import CategoriesList from './categories-list'

const useGetCategoryTree = vi.fn()
const usePreparedPageRows = vi.fn()

vi.mock('@/api/functions/catalogue', () => ({
  useGetCategoryTree: (...args: unknown[]) => useGetCategoryTree(...args),
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
// FlatList only adds skeleton plumbing this test doesn't own.
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

const categoryTree = (ids: number[]) => ({
  data: ids.map((id) => ({ id, name: `cat-${id}` })),
  isLoading: false,
})

describe('CategoriesList', () => {
  beforeEach(() => {
    useGetCategoryTree.mockReset()
    useGetCategoryTree.mockReturnValue({ data: [], isLoading: false })
    usePreparedPageRows.mockReset()
    usePreparedPageRows.mockReturnValue({ rows: [], isLoading: false })
  })

  test('renders the grid unchanged when no CMS page exists at the path', () => {
    useGetCategoryTree.mockReturnValue(categoryTree([1, 2, 3]))

    render(<CategoriesList />)

    expect(usePreparedPageRows).toHaveBeenCalledWith('categories')
    expect(screen.queryByTestId('widget-row')).not.toBeInTheDocument()
    expect(screen.getByText('cat-1')).toBeInTheDocument()
  })

  test('weaves builder rows between the category rows without replacing them', () => {
    useGetCategoryTree.mockReturnValue(categoryTree([1, 2, 3, 4, 5, 6, 7]))
    usePreparedPageRows.mockReturnValue({
      rows: [{ position: 2, style: {}, columns: [] }],
      isLoading: false,
    })

    const { container } = render(<CategoriesList />)

    // Every category survives; the widget sits after two rows of three.
    expect(screen.getAllByText(/^cat-\d$/)).toHaveLength(7)
    const rendered = Array.from(
      container.querySelectorAll('[data-testid="widget-row"], a'),
    ).map((node) =>
      node.getAttribute('data-testid') === 'widget-row'
        ? 'widget'
        : node.textContent,
    )
    expect(rendered).toEqual([
      'cat-1',
      'cat-2',
      'cat-3',
      'cat-4',
      'cat-5',
      'cat-6',
      'widget',
      'cat-7',
    ])
  })

  test('renders rows anchored at the top above the grid', () => {
    useGetCategoryTree.mockReturnValue(categoryTree([1, 2]))
    usePreparedPageRows.mockReturnValue({
      rows: [{ position: 0, style: {}, columns: [] }],
      isLoading: false,
    })

    render(<CategoriesList />)

    expect(screen.getByTestId('widget-row')).toHaveTextContent('widget@0')
    expect(screen.getByText('cat-1')).toBeInTheDocument()
  })

  test('holds back deep rows while the tree is still loading', () => {
    useGetCategoryTree.mockReturnValue({ data: undefined, isLoading: true })
    usePreparedPageRows.mockReturnValue({
      rows: [{ position: 3, style: {}, columns: [] }],
      isLoading: false,
    })

    render(<CategoriesList />)

    expect(screen.getByTestId('skeletons')).toBeInTheDocument()
    expect(screen.queryByTestId('widget-row')).not.toBeInTheDocument()
  })
})
