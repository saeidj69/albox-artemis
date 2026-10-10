import { CLARITY_EVENTS, type ClarityEventMap } from './clarity'
import { GTM_EVENTS, type GtmEventMap } from './gtm'
import { PLAUSIBLE_EVENTS, type PlausibleEventMap } from './plausible'
import { WE_EVENTS, type WEEventMap } from './webengage'

export const EVENTS = {
  ...PLAUSIBLE_EVENTS,
  ...GTM_EVENTS,
  ...CLARITY_EVENTS,
  ...WE_EVENTS,
} as const

export type AnalyticsEventName = (typeof EVENTS)[keyof typeof EVENTS]

type AllEventNames =
  | keyof PlausibleEventMap
  | keyof GtmEventMap
  | keyof ClarityEventMap
  | keyof WEEventMap

type VendorPayloads<K extends string> = (K extends keyof PlausibleEventMap
  ? { plausible: PlausibleEventMap[K] }
  : unknown) &
  (K extends keyof GtmEventMap ? { gtm: GtmEventMap[K] } : unknown) &
  (K extends keyof ClarityEventMap
    ? { clarity: ClarityEventMap[K] }
    : unknown) &
  (K extends keyof WEEventMap ? { webengage: WEEventMap[K] } : unknown)

export type AnalyticsEventMap = {
  [K in AllEventNames]: VendorPayloads<K>
}

export { PLAUSIBLE_EVENTS } from './plausible'
export type { PlausibleEventMap } from './plausible'
export { GTM_EVENTS } from './gtm'
export type {
  GtmEventMap,
  GtmEcommerceItem,
  GtmEcommerceCartItem,
  GtmItemListEcommerce,
  GtmSelectItemEcommerce,
  GtmValueEcommerce,
  GtmCouponEcommerce,
  GtmViewItemEcommerce,
  GtmViewCartEcommerce,
  GtmAddToCartEcommerce,
  GtmRemoveFromCartEcommerce,
  GtmBeginCheckoutEcommerce,
  GtmPurchaseEcommerce,
  GtmAuthPayload,
} from './gtm'
export { CLARITY_EVENTS } from './clarity'
export type { ClarityEventMap } from './clarity'
export { WE_EVENTS } from './webengage'
export type {
  WEEventMap,
  WESignUpPayload,
  WEViewItemPayload,
  WEViewCategoryPayload,
  WEViewGamesPayload,
  WEViewCampaignPayload,
  WEViewCartPayload,
  WEViewCheckoutPayload,
  WEOrderSubmitPayload,
} from './webengage'
