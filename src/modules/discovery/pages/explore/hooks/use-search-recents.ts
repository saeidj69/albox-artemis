import { useCallback } from 'react'

import { useAtom } from 'jotai'

import {
  mergeRecentSearches,
  recentSearchesAtom,
} from '../atoms/search-recent.atom'

const useSearchRecents = () => {
  const [recents, setRecents] = useAtom(recentSearchesAtom)

  const pushRecent = useCallback(
    (q: string) => {
      setRecents((prev) => mergeRecentSearches(prev, q))
    },
    [setRecents],
  )

  const removeRecentAt = useCallback(
    (index: number) => {
      setRecents((prev) => prev.filter((_, i) => i !== index))
    },
    [setRecents],
  )

  const clearAllRecents = useCallback(() => {
    setRecents([])
  }, [setRecents])

  return {
    recents,
    pushRecent,
    removeRecentAt,
    clearAllRecents,
  }
}

export default useSearchRecents
