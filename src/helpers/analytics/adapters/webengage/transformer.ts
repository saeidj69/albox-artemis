import type {
  WEOrderSubmitPayload,
  WEViewCampaignPayload,
  WEViewCartPayload,
  WEViewCategoryPayload,
  WEViewCheckoutPayload,
  WEViewGamesPayload,
  WEViewItemPayload,
} from '../../events/webengage'

type NamedRef = { name?: string | null } | null | undefined

export type WEViewItemProduct = {
  id: number | string
  name: string
  boxDiscountedPrice: number
  boxRetailPrice?: number
  brand?: NamedRef
  category?: NamedRef
  discount?: number
  totalCashback?: number
}

export class WETransformer {
  private static discount(product: WEViewItemProduct): number {
    if (product.discount != null) return product.discount
    if (product.boxRetailPrice == null) return 0
    return Math.max(0, product.boxRetailPrice - product.boxDiscountedPrice)
  }

  static toViewItem(product: WEViewItemProduct): WEViewItemPayload {
    return {
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.category?.name ?? '',
      item_brand: product.brand?.name ?? '',
      discount: WETransformer.discount(product),
      cashback_percentage: product.totalCashback ?? 0,
      item_price: product.boxDiscountedPrice,
    }
  }

  static toViewCategory(input: {
    category: string
    subcategory?: string
  }): WEViewCategoryPayload {
    return {
      item_category: input.category,
      item_subcategory: input.subcategory ?? '',
    }
  }

  static toViewGames(gameId: number): WEViewGamesPayload {
    return {
      game_name: gameId,
    }
  }

  static toViewCampaign(campaignId: number): WEViewCampaignPayload {
    return {
      campaign_name: campaignId,
    }
  }

  static toViewCart(input: {
    lines: Array<{ product: { id: number | string }; quantity: number }>
    value: number
  }): WEViewCartPayload {
    return {
      item_count: input.lines.reduce(
        (count, line) => count + (line.quantity || 0),
        0,
      ),
      value: input.value,
      item_id: input.lines.map((line) => String(line.product.id)).join(','),
    }
  }

  static toViewCheckout(input: {
    walletHasBalance: number
    timeslot: string
  }): WEViewCheckoutPayload {
    return {
      wallet_has_balance: input.walletHasBalance,
      timeslot: input.timeslot,
    }
  }

  static toOrderSubmit(input: {
    paymentMethod: 'ipg' | 'cod' | 'credit' | null
    lines: Array<{ product: { id: number | string }; quantity: number }>
    value: number
    coupon?: string
  }): WEOrderSubmitPayload {
    const cart = WETransformer.toViewCart({
      lines: input.lines,
      value: input.value,
    })

    return {
      selected_payment_method: WETransformer.paymentMethodId(
        input.paymentMethod,
      ),
      item_id: cart.item_id,
      item_count: cart.item_count,
      value: cart.value,
      coupon: input.coupon ?? '',
    }
  }

  private static paymentMethodId(
    method: 'ipg' | 'cod' | 'credit' | null,
  ): number {
    if (method === 'ipg') return 1
    if (method === 'cod') return 2
    if (method === 'credit') return 3
    return 0
  }
}
