'use client'

import { useMemo } from 'react'

import { RiArrowDownSLine } from '@remixicon/react'

import type { ListingCategory } from '@/api/models'

import Checkbox from '@/lib/Checkbox'
import { cn } from '@/lib/utils'

export function filterCategoriesBySearch(
  nodes: ListingCategory[],
  query: string,
): ListingCategory[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  return nodes
    .map((node) => {
      const filteredChildren = filterCategoriesBySearch(node.children, query)
      const selfMatch = node.name.toLowerCase().includes(q)
      if (selfMatch || filteredChildren.length > 0) {
        return {
          ...node,
          children: selfMatch ? node.children : filteredChildren,
        }
      }
      return null
    })
    .filter((n): n is ListingCategory => n != null)
}

function anyDescendantCategorySelected(
  node: ListingCategory,
  selectedIds: Set<number>,
): boolean {
  for (const child of node.children) {
    if (selectedIds.has(child.id)) return true
    if (
      child.children.length > 0 &&
      anyDescendantCategorySelected(child, selectedIds)
    ) {
      return true
    }
  }
  return false
}

type CategoryTreeRowProps = {
  node: ListingCategory
  depth: number
  selectedIds: Set<number>
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  onToggleCategory: (id: number) => void
}

const CategoryTreeRow = (props: CategoryTreeRowProps) => {
  const {
    node,
    depth,
    selectedIds,
    expandedIds,
    onToggleExpand,
    onToggleCategory,
  } = props

  const hasChildren = node.children.length > 0
  const expanded = expandedIds.has(node.id)
  const selfSelected = selectedIds.has(node.id)
  const descendantSelected =
    hasChildren && anyDescendantCategorySelected(node, selectedIds)
  const checkboxChecked: boolean | 'indeterminate' = selfSelected
    ? true
    : descendantSelected
      ? 'indeterminate'
      : false

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selfSelected}
    >
      <div
        className="flex items-center gap-2 py-1.5"
        style={{ paddingInlineStart: depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="text-text-secondary hover:text-text-primary shrink-0 rounded p-0.5 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? 'بستن زیرمجموعه' : 'باز کردن زیرمجموعه'}
            onClick={() => onToggleExpand(node.id)}
          >
            <RiArrowDownSLine
              className={cn(
                'size-5 transition-transform duration-200',
                expanded && '-rotate-180',
              )}
              aria-hidden
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}

        <Checkbox
          checked={checkboxChecked}
          onCheckedChange={(value) => {
            if (value === 'indeterminate') return
            onToggleCategory(node.id)
          }}
          aria-label={node.name}
        />

        <span className="typo-body-medium text-text-primary min-w-0 flex-1 text-start">
          {node.name}
        </span>
      </div>

      {hasChildren && expanded ? (
        <div>
          {node.children.map((child) => (
            <CategoryTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onToggleCategory={onToggleCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export type CategoryFilterTreeProps = {
  nodes: ListingCategory[]
  selectedIds: Set<number>
  expandedIds: Set<number>
  searchQuery: string
  onToggleExpand: (id: number) => void
  onToggleCategory: (id: number) => void
}

const CategoryFilterTree = (props: CategoryFilterTreeProps) => {
  const {
    nodes,
    selectedIds,
    expandedIds,
    searchQuery,
    onToggleExpand,
    onToggleCategory,
  } = props

  const filtered = useMemo(
    () => filterCategoriesBySearch(nodes, searchQuery),
    [nodes, searchQuery],
  )

  if (filtered.length === 0) {
    return (
      <p className="typo-body-small text-text-secondary py-6 text-center">
        دسته‌ای پیدا نشد
      </p>
    )
  }

  return (
    <div className="flex flex-col" role="tree" aria-multiselectable="true">
      {filtered.map((node) => (
        <CategoryTreeRow
          key={node.id}
          node={node}
          depth={0}
          selectedIds={selectedIds}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onToggleCategory={onToggleCategory}
        />
      ))}
    </div>
  )
}

export default CategoryFilterTree
