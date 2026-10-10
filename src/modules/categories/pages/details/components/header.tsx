'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useGetCategoryTree } from '@/api/functions/catalogue'

import CategoryChipsGridList, {
  type CategoryChipsGridListHandle,
} from './category-chips-grid-list'
import CategorySubcategoriesSection from './category-subcategories-section'
import { findTopLevelCategoryForRoute } from './category-tree-helpers'

type CategoriesHeaderProps = {
  categoryId: number
}

const CategoriesHeader = (props: CategoriesHeaderProps) => {
  const { categoryId } = props

  const chipsGridRef = useRef<CategoryChipsGridListHandle>(null)

  const { data: categories, isLoading } = useGetCategoryTree({
    query: {
      select(data) {
        return data?.categories || []
      },
    },
  })

  const list = useMemo(() => categories ?? [], [categories])

  useEffect(() => {
    if (isLoading || !list.length) return

    const top = findTopLevelCategoryForRoute(list, categoryId)
    if (!top) return

    const index = list.findIndex((c) => c.id === top.id)
    if (index < 0) return

    const frame = requestAnimationFrame(() => {
      chipsGridRef.current?.scrollToIndex(index)
    })
    return () => cancelAnimationFrame(frame)
  }, [categoryId, isLoading, list])

  return (
    <div className="space-y-1">
      <CategoryChipsGridList
        ref={chipsGridRef}
        categories={list}
        isLoading={isLoading}
        categoryId={categoryId}
      />
      <CategorySubcategoriesSection
        categories={list}
        categoryId={categoryId}
        isLoading={isLoading}
      />
    </div>
  )
}

export default CategoriesHeader

export type { CategoryChipsGridListHandle } from './category-chips-grid-list'
