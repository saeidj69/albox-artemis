import type { AnalyticsFlag } from '../flag'

export const WE_EVENTS = {
  REGISTER: 'sign_up',
  LOGIN: 'login',
  VIEW_ITEM: 'view_item',
  VIEW_CATEGORY: 'view_category',
  VIEW_GAMES: 'view_games',
  VIEW_CAMPAIGN: 'view_campaign',
  BASKET_INITIATED: 'basket_initiated',
  BASKET_CLEARED: 'basket_cleared',
  VIEW_CART: 'view_cart',
  VIEW_CHECKOUT: 'view_checkout',
  ORDER_SUBMIT: 'order_submit',
} as const

export type WESignUpPayload = {
  mode: 'otp'
}

export type WEViewItemPayload = {
  item_id: string
  item_name: string
  item_category: string
  item_brand: string
  discount: number
  cashback_percentage: number
  item_price: number
}

export type WEViewCategoryPayload = {
  item_category: string
  item_subcategory: string
}

export type WEViewGamesPayload = {
  game_name: number
}

export type WEViewCampaignPayload = {
  campaign_name: number
}

export type WEViewCartPayload = {
  item_count: number
  value: number
  item_id: string
}

export type WEViewCheckoutPayload = {
  wallet_has_balance: number
  timeslot: string
}

export type WEOrderSubmitPayload = {
  selected_payment_method: number
  item_id: string
  item_count: number
  value: number
  coupon: string
}

export type WEEventMap = {
  [WE_EVENTS.REGISTER]: WESignUpPayload
  [WE_EVENTS.VIEW_ITEM]: WEViewItemPayload
  [WE_EVENTS.VIEW_CATEGORY]: WEViewCategoryPayload
  [WE_EVENTS.VIEW_GAMES]: WEViewGamesPayload
  [WE_EVENTS.VIEW_CAMPAIGN]: WEViewCampaignPayload
  [WE_EVENTS.BASKET_INITIATED]: AnalyticsFlag
  [WE_EVENTS.BASKET_CLEARED]: AnalyticsFlag
  [WE_EVENTS.VIEW_CART]: WEViewCartPayload
  [WE_EVENTS.VIEW_CHECKOUT]: WEViewCheckoutPayload
  [WE_EVENTS.ORDER_SUBMIT]: WEOrderSubmitPayload
}
