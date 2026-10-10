import { describe, expect, test } from 'vitest'

import { act, renderHook } from '@/utils/test-utils'

import { useSearchFilterDraft } from './use-search-filter-draft'

describe('useSearchFilterDraft', () => {
  test('toggles categoryId in filter draft', () => {
    const { result } = renderHook(() => useSearchFilterDraft())

    act(() => {
      result.current.toggleCategoryId(10)
    })

    expect(result.current.draft.categoryIds.has(10)).toBe(true)

    act(() => {
      result.current.toggleCategoryId(10)
    })

    expect(result.current.draft.categoryIds.has(10)).toBe(false)
  })

  test('toggles brandId in filter draft', () => {
    const { result } = renderHook(() => useSearchFilterDraft())

    act(() => {
      result.current.toggleBrandId(5)
    })

    expect(result.current.draft.brandIds.has(5)).toBe(true)

    act(() => {
      result.current.toggleBrandId(5)
    })

    expect(result.current.draft.brandIds.has(5)).toBe(false)
  })

  test('sets availableOnly state', () => {
    const { result } = renderHook(() => useSearchFilterDraft())

    act(() => {
      result.current.setAvailableOnly(true)
    })

    expect(result.current.draft.availableOnly).toBe(true)
  })
})
