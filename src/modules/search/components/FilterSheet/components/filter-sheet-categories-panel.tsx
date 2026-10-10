'use client'

import { useCallback, useMemo, useState } from 'react'

import { CategoryFilterTree } from '@/components/ListingFilterParts'

import { useSearchFilterDraft } from '@/modules/search/hooks/use-search-filter-draft'

import { useGetCategoryTree } from '@/api/functions/catalogue'

import SearchInput from '@/lib/SearchInput'

const FilterSheetCategoriesPanel = () => {
  const [categorySearch, setCategorySearch] = useState('')
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(
    () => new Set(),
  )

  const { draft, toggleCategoryId } = useSearchFilterDraft()

  const { data: categoryTreeResponse, isLoading: isCategoryTreeLoading } =
    useGetCategoryTree({
      query: {
        select(data) {
          return data?.categories ?? []
        },
      },
    })

  const categoriesTree = useMemo(
    () => categoryTreeResponse ?? [],
    [categoryTreeResponse],
  )

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        value={categorySearch}
        onChange={(event) => setCategorySearch(event.target.value)}
        placeholder="جستجو در دسته‌بندی‌ها"
        aria-label="جستجو در دسته‌بندی‌ها"
      />

      <div>
        {isCategoryTreeLoading ? (
          <p className="typo-body-small text-text-secondary py-8 text-center">
            در حال بارگذاری…
          </p>
        ) : categoriesTree.length === 0 ? (
          <p className="typo-body-small text-text-secondary py-8 text-center">
            دسته‌بندی‌ای موجود نیست
          </p>
        ) : (
          <CategoryFilterTree
            nodes={categoriesTree}
            selectedIds={draft.categoryIds}
            expandedIds={expandedCategoryIds}
            searchQuery={categorySearch}
            onToggleExpand={handleToggleExpand}
            onToggleCategory={toggleCategoryId}
          />
        )}
      </div>
    </div>
  )
}

export default FilterSheetCategoriesPanel
