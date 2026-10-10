export const GTM_EVENTS = {
  REGISTER: 'sign_up',
  LOGIN: 'login',
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  VIEW_CART: 'view_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
} as const

export type GtmEcommerceItem = {
  item_id: string
  item_name: string
  item_brand: string
  item_category: string
  item_variant: string
  price: number
  index: number
  quantity: number
  discount: number
}

export type GtmEcommerceCartItem = Omit<GtmEcommerceItem, 'index'>

export type GtmItemListEcommerce = {
  item_list_id: string
  item_list_name: string
  items: Array<
    GtmEcommerceItem & {
      item_list_id: string
      item_list_name: string
    }
  >
}

export type GtmSelectItemEcommerce = {
  item_list_id: string
  item_list_name: string
  items: GtmEcommerceItem[]
}

export type GtmValueEcommerce<
  TItem extends GtmEcommerceCartItem = GtmEcommerceItem,
> = {
  currency: 'IRR'
  value: number
  items: TItem[]
}

export type GtmCouponEcommerce<
  TItem extends GtmEcommerceCartItem = GtmEcommerceItem,
> = GtmValueEcommerce<TItem> & {
  coupon: string
}

export type GtmViewItemEcommerce = GtmValueEcommerce
export type GtmViewCartEcommerce = GtmValueEcommerce
export type GtmAddToCartEcommerce = GtmCouponEcommerce<GtmEcommerceCartItem>
export type GtmRemoveFromCartEcommerce = GtmValueEcommerce<GtmEcommerceCartItem>
export type GtmBeginCheckoutEcommerce = GtmCouponEcommerce

export type GtmPurchaseEcommerce = {
  order_id: string
  value: number
  tax: number
  shipping: number
  coupon: string
  items: GtmEcommerceItem[]
}

export type GtmAuthPayload = {
  method: 'otp'
  user_id: string
  user_type: 'buyer'
}

export type GtmEventMap = {
  [GTM_EVENTS.REGISTER]: GtmAuthPayload
  [GTM_EVENTS.LOGIN]: GtmAuthPayload
  [GTM_EVENTS.VIEW_ITEM_LIST]: {
    ecommerce: GtmItemListEcommerce
  }
  [GTM_EVENTS.SELECT_ITEM]: {
    ecommerce: GtmSelectItemEcommerce
  }
  [GTM_EVENTS.VIEW_ITEM]: {
    ecommerce: GtmViewItemEcommerce
  }
  [GTM_EVENTS.ADD_TO_CART]: {
    ecommerce: GtmAddToCartEcommerce
  }
  [GTM_EVENTS.VIEW_CART]: {
    ecommerce: GtmViewCartEcommerce
  }
  [GTM_EVENTS.REMOVE_FROM_CART]: {
    ecommerce: GtmRemoveFromCartEcommerce
  }
  [GTM_EVENTS.BEGIN_CHECKOUT]: {
    ecommerce: GtmBeginCheckoutEcommerce
  }
  [GTM_EVENTS.PURCHASE]: {
    ecommerce: GtmPurchaseEcommerce
  }
}
