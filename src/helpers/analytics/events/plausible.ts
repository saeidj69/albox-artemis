import type { AnalyticsFlag } from '../flag'

export const PLAUSIBLE_EVENTS = {
  ADDED_TO_BASKET: 'added_to_basket',
  PRODUCT_VIEWED: 'product_viewed',
  APP_OPENED: 'app_opened',
  CHECKOUT_STARTED: 'checkout_started',
  DELIVERY_TIME_SELECTED: 'delivery_time_selected',
  PAYMENT_METHOD_SELECTED: 'payment_method_selected',
  FINALIZED_ORDER: 'finalized_order',
  BAROOK_NET_PAYMENT: 'barook_net_payment',
  BAROOK_AVAILABLE_CREDIT: 'barook_available_credit',
} as const

export type PlausibleEventMap = {
  [PLAUSIBLE_EVENTS.ADDED_TO_BASKET]: {
    source:
      | 'product_card'
      | 'product_single_page'
      | 'product_decreased'
      | 'product_removed'
  }
  [PLAUSIBLE_EVENTS.PRODUCT_VIEWED]: AnalyticsFlag
  [PLAUSIBLE_EVENTS.APP_OPENED]: AnalyticsFlag
  [PLAUSIBLE_EVENTS.CHECKOUT_STARTED]: AnalyticsFlag
  [PLAUSIBLE_EVENTS.DELIVERY_TIME_SELECTED]:
    | { type: 'delivery_time_selected'; slot: string }
    | { type: 'delivery_time_finalized' }
  [PLAUSIBLE_EVENTS.PAYMENT_METHOD_SELECTED]: {
    method:
      | 'payment_online'
      | 'payment_cash_on_delivery'
      | 'payment_online_after_finalization'
  }
  [PLAUSIBLE_EVENTS.FINALIZED_ORDER]: AnalyticsFlag
  [PLAUSIBLE_EVENTS.BAROOK_NET_PAYMENT]: AnalyticsFlag
  [PLAUSIBLE_EVENTS.BAROOK_AVAILABLE_CREDIT]: AnalyticsFlag
}
