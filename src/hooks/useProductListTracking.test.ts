import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import { useProductListTracking } from './useProductListTracking'

const track = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

const product = {
  id: 7,
  name: 'روغن مایع',
  unitInBox: 12,
  boxDiscountedPrice: 900_000,
  boxRetailPrice: 1_000_000,
  brand: { name: 'لادن' },
  category: { name: 'روغن' },
} as unknown as ListingProductSummary

const list = { itemListId: 'category-11', itemListName: 'category' }

describe('useProductListTracking', () => {
  beforeEach(() => {
    track.mockReset()
  })

  test('tracks view_item_list for a visible product with its list and position', () => {
    const { result } = renderHook(() => useProductListTracking(list))

    result.current.onProductVisible(product, 5)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_ITEM_LIST, {
      gtm: {
        ecommerce: {
          item_list_id: 'category-11',
          item_list_name: 'category',
          items: [
            expect.objectContaining({
              item_id: '7',
              item_name: 'روغن مایع',
              index: 5,
              item_list_id: 'category-11',
              item_list_name: 'category',
            }),
          ],
        },
      },
    })
  })

  test('tracks select_item for an opened product with its list and position', () => {
    const { result } = renderHook(() => useProductListTracking(list))

    result.current.onProductOpen(product, 23)

    expect(track).toHaveBeenCalledWith(EVENTS.SELECT_ITEM, {
      gtm: {
        ecommerce: {
          item_list_id: 'category-11',
          item_list_name: 'category',
          items: [expect.objectContaining({ item_id: '7', index: 23 })],
        },
      },
    })
  })

  test('tracks nothing until a callback is invoked', () => {
    renderHook(() => useProductListTracking(list))

    expect(track).not.toHaveBeenCalled()
  })
})
