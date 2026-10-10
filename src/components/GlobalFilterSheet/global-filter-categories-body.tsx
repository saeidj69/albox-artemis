'use client'

import { useCallback, useState } from 'react'

import { CategoryFilterTree } from '@/components/ListingFilterParts'

import type { ListingCategory } from '@/api/models'

import SearchInput from '@/lib/SearchInput'

export type GlobalFilterCategoriesBodyProps = {
  nodes: ListingCategory[]
  isLoading?: boolean
  selectedIds: Set<number>
  onToggleCategory: (id: number) => void
}

const GlobalFilterCategoriesBody = (props: GlobalFilterCategoriesBodyProps) => {
  const { nodes, isLoading, selectedIds, onToggleCategory } = props

  const [categorySearch, setCategorySearch] = useState('')
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(
    () => new Set(),
  )

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (isLoading) {
    return (
      <p className="typo-body-small text-text-secondary py-8 text-center">
        در حال بارگذاری…
      </p>
    )
  }

  if (nodes.length === 0) {
    return (
      <p className="typo-body-small text-text-secondary py-8 text-center">
        دسته‌بندی‌ای موجود نیست
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        placeholder="جستجو در دسته‌بندی‌ها"
        aria-label="جستجو در دسته‌بندی‌ها"
      />
      <CategoryFilterTree
        nodes={nodes}
        selectedIds={selectedIds}
        expandedIds={expandedCategoryIds}
        searchQuery={categorySearch}
        onToggleExpand={handleToggleExpand}
        onToggleCategory={onToggleCategory}
      />
    </div>
  )
}

export default GlobalFilterCategoriesBody
