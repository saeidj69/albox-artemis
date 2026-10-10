import type { ReactNode } from 'react'

import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import CategoryDetailsPage from './index'

const track = vi.fn()
const mockUseGetCategoryTree = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/api/functions/catalogue', () => ({
  useGetCategoryTree: (...args: unknown[]) => mockUseGetCategoryTree(...args),
}))

vi.mock('@/components/Header', () => ({
  default: () => null,
  HeaderLogo: () => null,
}))
vi.mock('@/components/Header/components/HeaderAnimatedTitle', () => ({
  default: () => null,
}))
vi.mock('@/components/Header/components/HeaderBackButton', () => ({
  default: () => null,
}))
vi.mock('@/components/Layout', () => ({
  default: {
    Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}))
vi.mock('./components/categories-filters-row', () => ({ default: () => null }))
vi.mock('./components/categories-tabs-row', () => ({ default: () => null }))
vi.mock('./components/category-products-section', () => ({
  default: () => null,
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}))

describe('CategoryDetailsPage tracking', () => {
  beforeEach(() => {
    track.mockReset()
    mockUseGetCategoryTree.mockReset()
  })

  test('tracks view_category for a subcategory', () => {
    mockUseGetCategoryTree.mockReturnValue({
      data: {
        title: 'روغن',
        viewNames: { category: 'روغن', subcategory: 'روغن مایع' },
      },
    })

    render(<CategoryDetailsPage categoryId={11} searchParams={{}} />)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CATEGORY, {
      webengage: {
        item_category: 'روغن',
        item_subcategory: 'روغن مایع',
      },
    })
  })

  test('does not track view_category when the category is missing', () => {
    mockUseGetCategoryTree.mockReturnValue({
      data: {
        title: '-',
        viewNames: null,
      },
    })

    render(<CategoryDetailsPage categoryId={99} searchParams={{}} />)

    expect(track).not.toHaveBeenCalled()
  })
})
