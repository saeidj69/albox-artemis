import { STORAGE_KEYS } from '@/constants'
import { atomWithStorage } from 'jotai/utils'

export const MAX_RECENTS = 5

export const recentSearchesAtom = atomWithStorage<string[]>(
  STORAGE_KEYS.SEARCH_RECENT_QUERIES,
  [],
)

/**
 * Prepends `next`, removes case-insensitive duplicates, caps at `max`.
 */
export function mergeRecentSearches(
  prev: string[],
  next: string,
  max = MAX_RECENTS,
): string[] {
  const trimmed = next.trim()
  if (trimmed.length < 2) return prev
  const normalized = trimmed.toLowerCase()
  const filtered = prev.filter((q) => q.trim().toLowerCase() !== normalized)
  return [trimmed, ...filtered].slice(0, max)
}
