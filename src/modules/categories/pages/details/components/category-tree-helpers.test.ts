import { describe, expect, test } from 'vitest'

import type { ListingCategory } from '@/api/models'

import { getCategoryViewNames } from './category-tree-helpers'

const category = (
  id: number,
  name: string,
  children: ListingCategory[] = [],
): ListingCategory => ({
  id,
  name,
  description: null,
  images: [],
  parentId: null,
  children,
})

const tree: ListingCategory[] = [
  category(1, 'روغن', [category(11, 'روغن مایع'), category(12, 'روغن جامد')]),
  category(2, 'لبنیات'),
]

describe('getCategoryViewNames', () => {
  test('uses the top-level name and an empty subcategory for a parent category', () => {
    expect(getCategoryViewNames(tree, 1)).toEqual({
      category: 'روغن',
      subcategory: '',
    })
  })

  test('uses the parent name and current name for a subcategory', () => {
    expect(getCategoryViewNames(tree, 11)).toEqual({
      category: 'روغن',
      subcategory: 'روغن مایع',
    })
  })

  test('returns null when the category is missing', () => {
    expect(getCategoryViewNames(tree, 99)).toBeNull()
  })
})
