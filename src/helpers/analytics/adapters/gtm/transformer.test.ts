import { describe, expect, test } from 'vitest'

import { GtmTransformer } from './transformer'

const listingProduct = {
  id: 101,
  name: 'تست محصول',
  unitInBox: 12,
  boxDiscountedPrice: 100_000,
  boxRetailPrice: 120_000,
  brand: { name: 'بهار' },
  category: { name: 'روغن' },
}

describe('GtmTransformer.toBasketLine', () => {
  const baseProduct = {
    productId: 101,
    quantity: 2,
    errorMessages: [],
  }

  test('maps a checked product using the server details', () => {
    const line = GtmTransformer.toBasketLine(
      {
        ...baseProduct,
        status: 'ok',
        details: {
          name: 'تست محصول',
          unitInBox: 12,
          netPrice: 100_000,
          boxRetailPrice: 120_000,
        },
      } as unknown as Parameters<typeof GtmTransformer.toBasketLine>[0],
      { title: 'نام محلی', priceWhenAdded: 1 },
    )

    expect(line).toEqual({
      product: {
        id: 101,
        name: 'تست محصول',
        unitInBox: 12,
        boxDiscountedPrice: 100_000,
        boxRetailPrice: 120_000,
      },
      quantity: 2,
    })
  })

  test('falls back to the client basket line when the product is not found', () => {
    const line = GtmTransformer.toBasketLine(
      {
        ...baseProduct,
        status: 'not_found',
        details: null,
      } as unknown as Parameters<typeof GtmTransformer.toBasketLine>[0],
      { title: 'نام محلی', priceWhenAdded: 90_000 },
    )

    expect(line).toEqual({
      product: {
        id: 101,
        name: 'نام محلی',
        unitInBox: 1,
        boxDiscountedPrice: 90_000,
        boxRetailPrice: undefined,
      },
      quantity: 2,
    })
  })

  test('defaults name and price when there is no details or fallback', () => {
    const line = GtmTransformer.toBasketLine({
      ...baseProduct,
      status: 'not_found',
      details: null,
    } as unknown as Parameters<typeof GtmTransformer.toBasketLine>[0])

    expect(line.product).toMatchObject({ name: '', boxDiscountedPrice: 0 })
  })
})

describe('GtmTransformer.toItem', () => {
  test('maps a product into a GTM ecommerce item', () => {
    expect(GtmTransformer.toItem(listingProduct, { index: 3 })).toEqual({
      item_id: '101',
      item_name: 'تست محصول',
      item_brand: 'بهار',
      item_category: 'روغن',
      item_variant: 'کارتن ۱۲ عددی',
      price: 100_000,
      index: 3,
      quantity: 1,
      discount: 20_000,
    })
  })

  test('defaults missing brand, category, index, and quantity', () => {
    expect(
      GtmTransformer.toItem({
        id: 7,
        name: 'بدون برند',
        unitInBox: 1,
        boxDiscountedPrice: 50_000,
      }),
    ).toEqual({
      item_id: '7',
      item_name: 'بدون برند',
      item_brand: '',
      item_category: '',
      item_variant: 'کارتن ۱ عددی',
      price: 50_000,
      index: 0,
      quantity: 1,
      discount: 0,
    })
  })

  test('uses an explicit discount when provided', () => {
    expect(
      GtmTransformer.toItem(
        {
          id: 518,
          name: 'روغن',
          unitInBox: 12,
          boxDiscountedPrice: 3_280_000,
          discount: 1_000_000,
        },
        { index: 0, quantity: 2 },
      ),
    ).toMatchObject({
      quantity: 2,
      discount: 1_000_000,
    })
  })
})

describe('GtmTransformer.toCartItem', () => {
  test('omits index for add/remove cart payloads', () => {
    expect(GtmTransformer.toCartItem(listingProduct, 3)).toEqual({
      item_id: '101',
      item_name: 'تست محصول',
      item_brand: 'بهار',
      item_category: 'روغن',
      item_variant: 'کارتن ۱۲ عددی',
      price: 100_000,
      quantity: 3,
      discount: 20_000,
    })
  })
})

describe('GtmTransformer.toViewItemList', () => {
  test('stamps every item with the list id/name', () => {
    const ecommerce = GtmTransformer.toViewItemList({
      itemListId: 'homepage_featured',
      itemListName: 'تخفیف روز',
      products: [listingProduct],
    })

    expect(ecommerce.item_list_id).toBe('homepage_featured')
    expect(ecommerce.items[0]).toMatchObject({
      item_list_id: 'homepage_featured',
      item_list_name: 'تخفیف روز',
      index: 0,
    })
  })

  test('offsets item indexes from startIndex', () => {
    const ecommerce = GtmTransformer.toViewItemList({
      itemListId: 'homepage_featured',
      itemListName: 'تخفیف روز',
      products: [listingProduct],
      startIndex: 3,
    })

    expect(ecommerce.items[0]).toMatchObject({ index: 3 })
  })
})

describe('GtmTransformer.toSelectItem', () => {
  test('wraps a single item with the source list context', () => {
    const ecommerce = GtmTransformer.toSelectItem({
      itemListId: 'homepage_featured',
      itemListName: 'تخفیف روز',
      product: listingProduct,
      index: 2,
    })

    expect(ecommerce.items).toHaveLength(1)
    expect(ecommerce.items[0]).toMatchObject({ index: 2 })
  })
})

describe('GtmTransformer.toViewItem', () => {
  test('derives currency and value from the item price', () => {
    expect(GtmTransformer.toViewItem(listingProduct)).toMatchObject({
      currency: 'IRR',
      value: 100_000,
    })
  })
})

describe('GtmTransformer.toAddToCart', () => {
  test('multiplies price by quantity for the ecommerce value', () => {
    expect(
      GtmTransformer.toAddToCart({
        product: listingProduct,
        quantity: 2,
        coupon: 'NEWYEAR2025',
      }),
    ).toEqual({
      currency: 'IRR',
      value: 200_000,
      coupon: 'NEWYEAR2025',
      items: [
        {
          item_id: '101',
          item_name: 'تست محصول',
          item_brand: 'بهار',
          item_category: 'روغن',
          item_variant: 'کارتن ۱۲ عددی',
          price: 100_000,
          quantity: 2,
          discount: 20_000,
        },
      ],
    })
  })
})

describe('GtmTransformer.toRemoveFromCart', () => {
  test('builds a single-item ecommerce payload without a coupon', () => {
    expect(
      GtmTransformer.toRemoveFromCart({ product: listingProduct, quantity: 1 }),
    ).toEqual({
      currency: 'IRR',
      value: 100_000,
      items: [
        {
          item_id: '101',
          item_name: 'تست محصول',
          item_brand: 'بهار',
          item_category: 'روغن',
          item_variant: 'کارتن ۱۲ عددی',
          price: 100_000,
          quantity: 1,
          discount: 20_000,
        },
      ],
    })
  })
})

describe('GtmTransformer.toViewCart', () => {
  test('sums item price * quantity into the ecommerce value', () => {
    const ecommerce = GtmTransformer.toViewCart({
      lines: [{ product: listingProduct, quantity: 2 }],
    })

    expect(ecommerce.value).toBe(200_000)
    expect(ecommerce.items[0]).toMatchObject({ index: 0, quantity: 2 })
  })
})

describe('GtmTransformer.toBeginCheckout', () => {
  test('uses the caller-supplied total rather than deriving one', () => {
    const ecommerce = GtmTransformer.toBeginCheckout({
      lines: [{ product: listingProduct, quantity: 2 }],
      value: 440_000,
      coupon: 'NEWYEAR2025',
    })

    expect(ecommerce).toMatchObject({
      currency: 'IRR',
      value: 440_000,
      coupon: 'NEWYEAR2025',
    })
    expect(ecommerce.items[0]).toMatchObject({ index: 0, quantity: 2 })
  })
})

describe('GtmTransformer.toPurchase', () => {
  test('assembles the full order ecommerce payload', () => {
    const ecommerce = GtmTransformer.toPurchase({
      orderId: '12345',
      value: 460_000,
      tax: 30_000,
      shipping: 20_000,
      coupon: 'NEWYEAR2025',
      lines: [{ product: listingProduct, quantity: 2 }],
    })

    expect(ecommerce).toMatchObject({
      order_id: '12345',
      value: 460_000,
      tax: 30_000,
      shipping: 20_000,
      coupon: 'NEWYEAR2025',
    })
    expect(ecommerce.items[0]).toMatchObject({ index: 0, quantity: 2 })
  })
})
