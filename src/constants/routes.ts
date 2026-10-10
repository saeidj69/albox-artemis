import type { ListingFiltersQuery } from '@/lib/utils/listing-filters-query'
import { serializeListingFiltersQuery } from '@/lib/utils/listing-filters-query'

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  SEARCH: '/search',
  BASKET: '/basket',
  CHECKOUT: '/checkout',
  ABOUT: '/about',
  FAQ: '/faq',
  TUTORIAL: '/tutorial',
  PRIVACY: '/privacy',
  DESIGN_SYSTEM: '/design-system',
  EXPERIMENTS: '/experiments',

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    IMPERSONATE: '/auth/impersonate',
  },

  GAME: (id: number | string) => `/games/${id}`,
  CAMPAIGN: (id: number | string) => `/campaign/${id}`,

  PROFILE: {
    ROOT: '/profile',
    EDIT: '/profile/edit',
  },

  SELECT_LOCATION: '/select-location',

  ADDRESSES: {
    ROOT: '/addresses',
    NEW: '/addresses/new',
    detail: (id: number | string) => `/addresses/${id}`,
    edit: (id: number | string) => `/addresses/${id}/edit`,
  },

  ORDERS: {
    ROOT: '/orders',
    detail: (id: number | string) => `/orders/${id}`,
    payment: (id: number | string) => `/orders/${id}/payment`,
  },

  WALLET: {
    ROOT: '/wallet',
    CHARGE: '/wallet/charge',
  },

  CAMPAIGNS: {
    ROOT: '/campaigns',
    detail: (id: number | string) => `/campaigns/${id}`,
  },

  PAYMENT: {
    RESULT: '/payment/result',
    barook: (orderId: number | string) => `/payment/barook/${orderId}`,
  },

  BRANDS: {
    ROOT: '/brands',
    detail: (id: number | string) => `/brands/${id}`,
  },

  CATEGORIES: {
    ROOT: '/categories',
    detail: (id: number | string, filters?: Partial<ListingFiltersQuery>) => {
      const path = `/categories/${id}`
      const query = serializeListingFiltersQuery(filters)
      return query ? `${path}?${query}` : path
    },
  },

  product: (id: number | string) => `/products/${id}`,

  search: (
    filters?: Partial<ListingFiltersQuery>,
    options?: { basePath?: string },
  ) => {
    const basePath = options?.basePath ?? '/search'
    const query = serializeListingFiltersQuery(filters)
    return query ? `${basePath}?${query}` : basePath
  },
} as const
