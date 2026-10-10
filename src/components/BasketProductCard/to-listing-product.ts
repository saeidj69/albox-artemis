import type { ProductBasketLine } from '@/modules/purchase/types'

import type {
  ListingProduct,
  OrderNotFoundBasketProduct,
  OrderNotOkBasketProduct,
  OrderOkBasketProduct,
} from '@/api/models'

export type BasketCheckProduct =
  | OrderOkBasketProduct
  | OrderNotOkBasketProduct
  | OrderNotFoundBasketProduct

const EMPTY_CATEGORY: ListingProduct['category'] = {
  id: 0,
  name: '',
  description: null,
  images: [],
  parentId: null,
}

const EMPTY_BRAND: ListingProduct['brand'] = {
  id: 0,
  name: '',
  manufacturer: { id: 0, name: '', description: null, images: [] },
  description: null,
  images: [],
}

/**
 * Maps a check-basket product + local basket line into a `ListingProduct`
 * so shared UI (`PriceTag`, `AddToBasketButton`) can consume it.
 * Local snapshot (`title`, `priceWhenAdded`) fills gaps when the check
 * response is `not_found` or has no details.
 */
export function toListingProduct(
  product: BasketCheckProduct,
  localProduct: ProductBasketLine,
): ListingProduct {
  if (product.status === 'not_found' || product.details == null) {
    const price = Math.max(1, localProduct.priceWhenAdded)

    return {
      id: localProduct.productId,
      name: localProduct.title,
      isPromoted: false,
      purchasableQuantity: 0,
      unitInBox: 1,
      boxRetailPrice: price,
      boxDiscountedPrice: price,
      unitRetailPrice: price,
      unitDiscountedPrice: price,
      unitDiscountAmount: 0,
      totalDiscount: 0,
      totalDiscountAmount: 0,
      totalCashback: 0,
      totalCashbackAmount: 0,
      category: EMPTY_CATEGORY,
      brand: EMPTY_BRAND,
      images: [],
      stepDiscounts: [],
    }
  }

  const { details } = product

  return {
    id: product.productId,
    name: details.name || localProduct.title,
    isPromoted: false,
    purchasableQuantity: details.maxPurchaseQuantity,
    unitInBox: details.unitInBox,
    boxRetailPrice: details.boxRetailPrice,
    boxDiscountedPrice: details.netPrice,
    unitRetailPrice: 0,
    unitDiscountedPrice: 0,
    unitDiscountAmount: 0,
    totalDiscount: details.discountPercentage,
    totalDiscountAmount: 0,
    // This adapter only feeds price and quantity controls. Cashback is rendered
    // directly from basket details; Listing's quantity-one amounts are unavailable.
    totalCashback: 0,
    totalCashbackAmount: 0,
    category: EMPTY_CATEGORY,
    brand: EMPTY_BRAND,
    images: details.images,
    stepDiscounts: [],
  }
}
