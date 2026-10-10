'use client'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { createSerializer, parseAsString, useQueryState } from 'nuqs'
import { useDebouncedValue } from 'rooks'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { PREPARED_PAGE_PATHS } from '@/modules/discovery/constants/prepared-page-paths'

import SearchInput from '@/lib/SearchInput'

import ExploreSearchSuggestions from './ExploreSearchSuggestions'
import ExplorePreparedContent from './components/ExplorePreparedContent'
import useSearchRecents from './hooks/use-search-recents'

const SEARCH_DEBOUNCE_MS = 300

const serializeSearchListingUrl = createSerializer({
  q: parseAsString,
})

const ExplorePage = () => {
  const router = useRouter()
  const { pushRecent } = useSearchRecents()

  const [query, setQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      clearOnDefault: true,
      history: 'replace',
    }),
  )
  const [debouncedQuery] = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const trimmed = debouncedQuery.trim()
  const searchEnabled = trimmed.length >= 2

  const selectRecentQuery = (nextQuery: string) => {
    setQuery(nextQuery)
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo />}
          center="جستجو"
          right={<HeaderBackButton />}
        />
      </Layout.Header>

      <main className="py-4">
        <SearchInput
          className="w-app"
          autoFocus
          value={query}
          onChange={(event) => void setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            if (!searchEnabled) return
            pushRecent(trimmed)
            router.push(
              serializeSearchListingUrl(ROUTES.SEARCH, { q: trimmed }),
            )
          }}
          aria-label="جست‌وجوی محصول"
        />

        <ExploreSearchSuggestions
          trimmed={trimmed}
          pushRecent={pushRecent}
          searchEnabled={searchEnabled}
          onSelectRecentQuery={selectRecentQuery}
        />

        {/* Marketing-owned filler for the pristine screen, below the recents. */}
        {!searchEnabled ? (
          <ExplorePreparedContent path={PREPARED_PAGE_PATHS.EXPLORE} />
        ) : null}
      </main>
    </>
  )
}

export default ExplorePage
