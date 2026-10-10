import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import FilterSheetBrandsPanel from './filter-sheet-brands-panel'

const useListBrandsListingInfinite = vi.fn()

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({
    location: { latitude: 36.2, longitude: 59.6 },
    isLoading: false,
  }),
}))

vi.mock('@/modules/search/hooks/use-search-filter-draft', () => ({
  useSearchFilterDraft: () => ({
    draft: { brandIds: [] },
    toggleBrandId: vi.fn(),
  }),
}))

vi.mock('@/api/functions/catalogue', () => ({
  useListBrandsListingInfinite: (...args: unknown[]) =>
    useListBrandsListingInfinite(...args),
}))

vi.mock('@/components/ListingFilterParts', () => ({
  BrandFilterList: () => <div data-testid="brand-filter-list" />,
}))

vi.mock('@/lib/SearchInput', () => ({
  default: () => <input aria-label="search brands" />,
}))

describe('FilterSheetBrandsPanel', () => {
  beforeEach(() => {
    useListBrandsListingInfinite.mockReset()
    useListBrandsListingInfinite.mockReturnValue({
      data: undefined,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    })
  })

  test('loads filter brands for the resolved location when the panel is active', () => {
    render(<FilterSheetBrandsPanel queryEnabled />)

    expect(useListBrandsListingInfinite).toHaveBeenCalledWith(
      {
        limit: 30,
        latitude: 36.2,
        longitude: 59.6,
      },
      expect.objectContaining({
        query: expect.objectContaining({ enabled: true }),
      }),
    )
  })
})
