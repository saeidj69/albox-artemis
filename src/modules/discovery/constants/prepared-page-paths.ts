/**
 * CMS page paths (Jupiter `Listing.Page.path`) the app addresses by name.
 *
 * Every other prepared page is reached through the `/pages/[...path]` route, so
 * only the slugs the client hard-codes belong here. A path listed here may not
 * exist in the admin yet — callers must treat a missing page as an empty state,
 * never as an error.
 */
export const PREPARED_PAGE_PATHS = {
  /** App home feed (`/`). */
  HOME: 'home',
  /** Optional marketing content under the search screen's empty state. */
  EXPLORE: 'explore',
  /** Optional CMS replacement for the categories tab (`/categories`). */
  CATEGORIES: 'categories',
  /** Optional CMS replacement for the brands tab (`/brands`). */
  BRANDS: 'brands',
} as const
