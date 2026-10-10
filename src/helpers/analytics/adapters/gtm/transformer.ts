import { persianDigits } from '@/utils/numbers'

import type {
  OrderNotFoundBasketProduct,
  OrderNotOkBasketProduct,
  OrderOkBasketProduct,
} from '@/api/models'

import type {
  GtmAddToCartEcommerce,
  GtmBeginCheckoutEcommerce,
  GtmEcommerceCartItem,
  GtmEcommerceItem,
  GtmItemListEcommerce,
  GtmPurchaseEcommerce,
  GtmRemoveFromCartEcommerce,
  GtmSelectItemEcommerce,
  GtmViewCartEcommerce,
  GtmViewItemEcommerce,
} from '../../events/gtm'

type NamedRef = { name?: string | null } | null | undefined

export type GtmEcommerceItemProduct = {
  id: number | string
  name: string
  unitInBox: number
  boxDiscountedPrice: number
  boxRetailPrice?: number
  brand?: NamedRef
  category?: NamedRef
  discount?: number
}

type GtmEcommerceLine = {
  product: GtmEcommerceItemProduct
  quantity: number
}

type GtmBasketCheckProduct =
  | OrderOkBasketProduct
  | OrderNotOkBasketProduct
  | OrderNotFoundBasketProduct

/** Client-side basket line used when the checked product has no details. */
type GtmBasketLineFallback = {
  title?: string
  priceWhenAdded?: number
}

type ItemOptions = {
  index?: number
  quantity?: number
}

type ToViewItemListOptions = {
  itemListId: string
  itemListName: string
  products: GtmEcommerceItemProduct[]
  /** Offset applied to each item's `index` (defaults to 0). */
  startIndex?: number
}

type ToSelectItemOptions = {
  itemListId: string
  itemListName: string
  product: GtmEcommerceItemProduct
  index?: number
}

type ToAddToCartOptions = {
  product: GtmEcommerceItemProduct
  quantity: number
  coupon?: string
}

type ToRemoveFromCartOptions = {
  product: GtmEcommerceItemProduct
  quantity: number
}

type ToViewCartOptions = {
  lines: GtmEcommerceLine[]
}

type ToBeginCheckoutOptions = {
  lines: GtmEcommerceLine[]
  value: number
  coupon?: string
}

type ToPurchaseOptions = {
  orderId: string
  value: number
  tax: number
  shipping: number
  coupon: string
  lines: GtmEcommerceLine[]
}

/**
 * Single place that builds every GTM ecommerce dataLayer payload, kept next to
 * the adapter (index.ts) that pushes them. Call sites hand over raw product/line
 * data; the field names and nesting shape here must stay in lockstep with the
 * tracking spec (dataLayer keys are contractual with the GTM tags/GA4 config).
 */
export class GtmTransformer {
  private static itemVariant(unitInBox: number): string {
    return `کارتن ${persianDigits(unitInBox)} عددی`
  }

  private static discount(product: GtmEcommerceItemProduct): number {
    if (product.discount != null) return product.discount
    if (product.boxRetailPrice == null) return 0
    return Math.max(0, product.boxRetailPrice - product.boxDiscountedPrice)
  }

  private static cartItem(
    product: GtmEcommerceItemProduct,
    quantity: number,
  ): GtmEcommerceCartItem {
    return {
      item_id: String(product.id),
      item_name: product.name,
      item_brand: product.brand?.name ?? '',
      item_category: product.category?.name ?? '',
      item_variant: GtmTransformer.itemVariant(product.unitInBox),
      price: product.boxDiscountedPrice,
      quantity,
      discount: GtmTransformer.discount(product),
    }
  }

  private static item(
    product: GtmEcommerceItemProduct,
    options: ItemOptions = {},
  ): GtmEcommerceItem {
    return {
      ...GtmTransformer.cartItem(product, options.quantity ?? 1),
      index: options.index ?? 0,
    }
  }

  static toCartItem(
    product: GtmEcommerceItemProduct,
    quantity: number,
  ): GtmEcommerceCartItem {
    return GtmTransformer.cartItem(product, quantity)
  }

  static toItem(
    product: GtmEcommerceItemProduct,
    options: ItemOptions = {},
  ): GtmEcommerceItem {
    return GtmTransformer.item(product, options)
  }

  /**
   * Maps a check-basket product to an ecommerce line, falling back to the
   * client basket line for name/price when the server returned no details.
   */
  static toBasketLine(
    product: GtmBasketCheckProduct,
    fallback?: GtmBasketLineFallback,
  ): GtmEcommerceLine {
    const details = product.status === 'not_found' ? null : product.details

    return {
      product: {
        id: product.productId,
        name: details?.name || fallback?.title || '',
        unitInBox: details?.unitInBox ?? 1,
        boxDiscountedPrice: details?.netPrice ?? fallback?.priceWhenAdded ?? 0,
        boxRetailPrice: details?.boxRetailPrice,
      },
      quantity: product.quantity,
    }
  }

  static toViewItemList(options: ToViewItemListOptions): GtmItemListEcommerce {
    const { itemListId, itemListName, products, startIndex = 0 } = options
    return {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: products.map((product, index) => ({
        ...GtmTransformer.item(product, { index: startIndex + index }),
        item_list_id: itemListId,
        item_list_name: itemListName,
      })),
    }
  }

  static toSelectItem(options: ToSelectItemOptions): GtmSelectItemEcommerce {
    const { itemListId, itemListName, product, index = 0 } = options
    return {
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: [GtmTransformer.item(product, { index })],
    }
  }

  static toViewItem(product: GtmEcommerceItemProduct): GtmViewItemEcommerce {
    const item = GtmTransformer.item(product)
    return {
      currency: 'IRR',
      value: item.price,
      items: [item],
    }
  }

  static toAddToCart(options: ToAddToCartOptions): GtmAddToCartEcommerce {
    const { product, quantity, coupon = '' } = options
    const item = GtmTransformer.cartItem(product, quantity)
    return {
      currency: 'IRR',
      value: item.price * quantity,
      coupon,
      items: [item],
    }
  }

  static toRemoveFromCart(
    options: ToRemoveFromCartOptions,
  ): GtmRemoveFromCartEcommerce {
    const { product, quantity } = options
    const item = GtmTransformer.cartItem(product, quantity)
    return {
      currency: 'IRR',
      value: item.price * quantity,
      items: [item],
    }
  }

  static toViewCart(options: ToViewCartOptions): GtmViewCartEcommerce {
    const { lines } = options
    const items = lines.map((line, index) =>
      GtmTransformer.item(line.product, { index, quantity: line.quantity }),
    )
    return {
      currency: 'IRR',
      value: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      items,
    }
  }

  static toBeginCheckout(
    options: ToBeginCheckoutOptions,
  ): GtmBeginCheckoutEcommerce {
    const { lines, value, coupon = '' } = options
    const items = lines.map((line, index) =>
      GtmTransformer.item(line.product, { index, quantity: line.quantity }),
    )
    return { currency: 'IRR', value, coupon, items }
  }

  static toPurchase(options: ToPurchaseOptions): GtmPurchaseEcommerce {
    const { orderId, value, tax, shipping, coupon, lines } = options
    const items = lines.map((line, index) =>
      GtmTransformer.item(line.product, { index, quantity: line.quantity }),
    )
    return {
      order_id: orderId,
      value,
      tax,
      shipping,
      coupon,
      items,
    }
  }
}
