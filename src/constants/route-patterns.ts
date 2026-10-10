import { ROUTES } from './routes'

export const TAB_ROOTS = [
  ROUTES.HOME,
  ROUTES.BRANDS.ROOT,
  ROUTES.CATEGORIES.ROOT,
  ROUTES.ORDERS.ROOT,
  ROUTES.BASKET,
] as const

export type TabRoot = (typeof TAB_ROOTS)[number]

export const STATIC_PARENTS: Record<string, string> = {
  [ROUTES.SEARCH]: ROUTES.HOME,
  [ROUTES.ABOUT]: ROUTES.HOME,
  [ROUTES.FAQ]: ROUTES.HOME,
  [ROUTES.WALLET.ROOT]: ROUTES.HOME,
  [ROUTES.WALLET.CHARGE]: ROUTES.WALLET.ROOT,
  [ROUTES.CAMPAIGNS.ROOT]: ROUTES.HOME,
  [ROUTES.PROFILE.EDIT]: ROUTES.HOME,
  [ROUTES.ADDRESSES.ROOT]: ROUTES.HOME,
  [ROUTES.ADDRESSES.NEW]: ROUTES.ADDRESSES.ROOT,
  [ROUTES.CHECKOUT]: ROUTES.BASKET,
  [ROUTES.PAYMENT.RESULT]: ROUTES.HOME,
}

export const PATTERN_PARENTS: { test: RegExp; parent: string }[] = [
  { test: /^\/products\/[^/]+$/, parent: ROUTES.HOME },
  { test: /^\/categories\/[^/]+$/, parent: ROUTES.CATEGORIES.ROOT },
  { test: /^\/brands\/[^/]+$/, parent: ROUTES.BRANDS.ROOT },
  { test: /^\/orders\/[^/]+$/, parent: ROUTES.ORDERS.ROOT },
  { test: /^\/orders\/[^/]+\/payment$/, parent: ROUTES.ORDERS.ROOT },
  { test: /^\/addresses\/[^/]+\/edit$/, parent: ROUTES.ADDRESSES.ROOT },
  { test: /^\/payment\/barook\/[^/]+$/, parent: ROUTES.ORDERS.ROOT },
  { test: /^\/campaigns\/[^/]+$/, parent: ROUTES.CAMPAIGNS.ROOT },
]
