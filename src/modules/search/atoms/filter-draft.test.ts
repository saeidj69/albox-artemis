import { describe, expect, test } from 'vitest'

import { createSearchFilterDraftFromParams, setsEqual } from './filter-draft'

describe('search filter draft atom utils', () => {
  test('setsEqual compares two number sets accurately', () => {
    expect(setsEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true)
    expect(setsEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false)
    expect(setsEqual(new Set([1, 2]), new Set([1, 4]))).toBe(false)
  })

  test('createSearchFilterDraftFromParams parses categoryIds, brandIds, and availableOnly from search params', () => {
    const draft = createSearchFilterDraftFromParams({
      categories: ['10', '20'],
      brands: ['5'],
      inStock: 'true',
    })

    expect(draft.categoryIds.has(10)).toBe(true)
    expect(draft.categoryIds.has(20)).toBe(true)
    expect(draft.brandIds.has(5)).toBe(true)
    expect(draft.availableOnly).toBe(true)
  })
})
