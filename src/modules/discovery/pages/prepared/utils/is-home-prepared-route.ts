import { PREPARED_PAGE_PATHS } from '@/modules/discovery/constants/prepared-page-paths'

/**
 * True when the dynamic segment(s) under `/pages` refer to the home feed
 * (`/pages/home` → `path` from `join` is `"home"`).
 */
export function isHomePreparedRoute(path: string): boolean {
  return path.trim() === PREPARED_PAGE_PATHS.HOME
}

/**
 * Whether this screen is the app home: home header and `useHomeDataPopulate`.
 *
 * Uses the **route** `path` prop and, when loaded, **`page.path`** from the API
 * so the slug stays aligned with the backend.
 */
export function resolveIsHomePreparedPage(
  routePath: string,
  page?: { path: string } | null,
): boolean {
  if (isHomePreparedRoute(routePath)) {
    return true
  }
  if (page != null && page.path.trim() === PREPARED_PAGE_PATHS.HOME) {
    return true
  }
  return false
}
