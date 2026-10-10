import type { ListingCategory } from '@/api/models'

/**
 * Finds the top-level category that owns the current route id (itself or a descendant).
 */
export function findTopLevelCategoryForRoute(
  categories: ListingCategory[],
  categoryId: number,
): ListingCategory | null {
  for (const top of categories) {
    if (top.id === categoryId) return top
    if (hasDescendantWithId(top, categoryId)) return top
  }
  return null
}

function hasDescendantWithId(node: ListingCategory, id: number): boolean {
  return (
    node.children?.some(
      (child) => child.id === id || hasDescendantWithId(child, id),
    ) ?? false
  )
}

/**
 * Finds a category node anywhere in the tree by id.
 */
export function findCategoryNodeById(
  categories: ListingCategory[],
  categoryId: number,
): ListingCategory | null {
  for (const node of categories) {
    if (node.id === categoryId) return node
    const found = node.children
      ? findCategoryNodeById(node.children, categoryId)
      : null
    if (found) return found
  }
  return null
}

export function getCategoryViewNames(
  categories: ListingCategory[],
  categoryId: number,
): { category: string; subcategory: string } | null {
  const top = findTopLevelCategoryForRoute(categories, categoryId)
  const current = findCategoryNodeById(categories, categoryId)
  if (!top || !current) return null

  return {
    category: top.name,
    subcategory: current.id === top.id ? '' : current.name,
  }
}
