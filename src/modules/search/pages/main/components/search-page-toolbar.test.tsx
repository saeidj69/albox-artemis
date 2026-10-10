import { ROUTES } from '@/constants'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { act, fireEvent, render, screen } from '@/utils/test-utils'

import SearchPageToolbar, {
  SEARCH_QUERY_DEBOUNCE_MS,
  type SearchPageToolbarProps,
} from './search-page-toolbar'

const { mockReplace, mockShowGlobalFilterSheet, mockShowGlobalSortSheet } =
  vi.hoisted(() => ({
    mockReplace: vi.fn(),
    mockShowGlobalFilterSheet: vi.fn(),
    mockShowGlobalSortSheet: vi.fn(),
  }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

vi.mock('@/components/GlobalFilterSheet', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/GlobalFilterSheet')>()
  return {
    ...actual,
    showGlobalFilterSheet: (...args: unknown[]) =>
      mockShowGlobalFilterSheet(...args),
  }
})

vi.mock('@/components/GlobalSortSheet', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/GlobalSortSheet')>()
  return {
    ...actual,
    showGlobalSortSheet: (...args: unknown[]) =>
      mockShowGlobalSortSheet(...args),
  }
})

type FilterSheetConfig = {
  onSubmit: (values: {
    categoryIds: number[]
    brandIds: number[]
    availableOnly: boolean
  }) => void
  onDiscard: () => void
}

type SortSheetConfig = {
  onSelect: (value: string) => void
}

const defaultProps: SearchPageToolbarProps = {
  searchParams: {},
  urlQuery: '',
  availableBrands: [],
  availableCategories: [],
  minRetailPrice: null,
  maxRetailPrice: null,
  isFiltersLoading: false,
}

const renderToolbar = (props?: Partial<SearchPageToolbarProps>) => {
  render(<SearchPageToolbar {...defaultProps} {...props} />)
  return screen.getByRole('searchbox')
}

const flushSearchDebounce = async (ms = SEARCH_QUERY_DEBOUNCE_MS) => {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

describe('SearchPageToolbar', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockShowGlobalFilterSheet.mockReset()
    mockShowGlobalSortSheet.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('does not replace immediately while typing, then commits the query after debounce', async () => {
    const input = renderToolbar({
      searchParams: { brands: '12' },
    })

    fireEvent.change(input, { target: { value: 'شامپو' } })

    expect(mockReplace).not.toHaveBeenCalled()

    await flushSearchDebounce(SEARCH_QUERY_DEBOUNCE_MS - 1)
    expect(mockReplace).not.toHaveBeenCalled()

    await flushSearchDebounce(1)

    expect(mockReplace).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith(
      ROUTES.search({ q: 'شامپو', brands: [12] }),
    )
  })

  test('does not replace when the trimmed query already matches the URL', async () => {
    renderToolbar({
      urlQuery: 'شامپو',
      searchParams: { q: 'شامپو' },
    })

    await flushSearchDebounce()

    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('commits the current query immediately on Enter', async () => {
    const input = renderToolbar()

    fireEvent.change(input, { target: { value: 'صابون' } })
    expect(mockReplace).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockReplace).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.search({ q: 'صابون' }))

    await flushSearchDebounce()
    expect(mockReplace).toHaveBeenCalledTimes(1)
  })

  test('syncs the input when the URL query changes to a different value', () => {
    const { rerender } = render(
      <SearchPageToolbar
        {...defaultProps}
        urlQuery="شامپو"
        searchParams={{ q: 'شامپو' }}
      />,
    )

    expect(screen.getByRole('searchbox')).toHaveValue('شامپو')

    rerender(
      <SearchPageToolbar
        {...defaultProps}
        urlQuery="صابون"
        searchParams={{ q: 'صابون' }}
      />,
    )

    expect(screen.getByRole('searchbox')).toHaveValue('صابون')
  })

  test('keeps a trailing space when the URL catches up to the trimmed query', () => {
    const { rerender } = render(
      <SearchPageToolbar {...defaultProps} urlQuery="" searchParams={{}} />,
    )
    const input = screen.getByRole('searchbox')

    fireEvent.change(input, { target: { value: 'شامپو ' } })

    rerender(
      <SearchPageToolbar
        {...defaultProps}
        urlQuery="شامپو"
        searchParams={{ q: 'شامپو' }}
      />,
    )

    expect(input).toHaveValue('شامپو ')
  })

  test('applies and discards listing filters while keeping the current query', () => {
    renderToolbar({
      urlQuery: 'شامپو',
      searchParams: {
        q: 'شامپو',
        brands: '1',
        categories: ['2', '3'],
        inStock: 'true',
        minPrice: '1000',
        maxPrice: '5000',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /فیلتر/ }))

    expect(mockShowGlobalFilterSheet).toHaveBeenCalledTimes(1)
    const { onSubmit, onDiscard } = mockShowGlobalFilterSheet.mock
      .calls[0][0] as FilterSheetConfig

    onSubmit({
      categoryIds: [8],
      brandIds: [9],
      availableOnly: true,
    })
    expect(mockReplace).toHaveBeenCalledWith(
      ROUTES.search({
        q: 'شامپو',
        categories: [8],
        brands: [9],
        inStock: true,
        minPrice: 1000,
        maxPrice: 5000,
      }),
    )

    mockReplace.mockClear()
    onSubmit({
      categoryIds: [],
      brandIds: [],
      availableOnly: false,
    })
    expect(mockReplace).toHaveBeenCalledWith(
      ROUTES.search({
        q: 'شامپو',
        minPrice: 1000,
        maxPrice: 5000,
      }),
    )

    mockReplace.mockClear()
    onDiscard()
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.search({ q: 'شامپو' }))
  })

  test('updates sort from the sort sheet and clears it for relevance', () => {
    renderToolbar({
      urlQuery: 'چای',
      searchParams: { q: 'چای', sort: 'price:desc' },
    })

    expect(screen.getByRole('button', { name: 'مرتب‌سازی' })).toHaveTextContent(
      'گران ترین',
    )

    fireEvent.click(screen.getByRole('button', { name: 'مرتب‌سازی' }))

    expect(mockShowGlobalSortSheet).toHaveBeenCalledTimes(1)
    const { onSelect } = mockShowGlobalSortSheet.mock
      .calls[0][0] as SortSheetConfig

    onSelect('price:asc')
    expect(mockReplace).toHaveBeenCalledWith(
      ROUTES.search({ q: 'چای', sort: 'price:asc' }),
    )

    mockReplace.mockClear()
    onSelect('relevance')
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.search({ q: 'چای' }))
  })

  test('falls back to the default sort label for an unknown sort value', () => {
    renderToolbar({
      urlQuery: '',
      searchParams: { sort: 'not-a-sort' },
    })

    expect(screen.getByRole('button', { name: 'مرتب‌سازی' })).toHaveTextContent(
      'مرتبط ترین',
    )
  })
})
