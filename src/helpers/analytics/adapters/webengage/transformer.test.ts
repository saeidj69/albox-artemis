import { describe, expect, test } from 'vitest'

import { WETransformer } from './transformer'

const listingProduct = {
  id: 101,
  name: 'تست محصول',
  boxDiscountedPrice: 100_000,
  boxRetailPrice: 120_000,
  brand: { name: 'بهار' },
  category: { name: 'روغن' },
  totalCashback: 2,
}

describe('WETransformer.toViewItem', () => {
  test('maps a product into the WebEngage view_item payload', () => {
    expect(WETransformer.toViewItem(listingProduct)).toEqual({
      item_id: '101',
      item_name: 'تست محصول',
      item_category: 'روغن',
      item_brand: 'بهار',
      discount: 20_000,
      cashback_percentage: 2,
      item_price: 100_000,
    })
  })

  test('defaults missing brand, category, cashback, and discount', () => {
    expect(
      WETransformer.toViewItem({
        id: 7,
        name: 'بدون برند',
        boxDiscountedPrice: 50_000,
      }),
    ).toEqual({
      item_id: '7',
      item_name: 'بدون برند',
      item_category: '',
      item_brand: '',
      discount: 0,
      cashback_percentage: 0,
      item_price: 50_000,
    })
  })

  test('uses an explicit discount when provided', () => {
    expect(
      WETransformer.toViewItem({
        ...listingProduct,
        discount: 1_000_000,
      }),
    ).toMatchObject({
      discount: 1_000_000,
    })
  })
})

describe('WETransformer.toViewCategory', () => {
  test('maps category and subcategory names into the WebEngage payload', () => {
    expect(
      WETransformer.toViewCategory({
        category: 'روغن',
        subcategory: 'روغن مایع',
      }),
    ).toEqual({
      item_category: 'روغن',
      item_subcategory: 'روغن مایع',
    })
  })

  test('defaults a missing subcategory to an empty string', () => {
    expect(WETransformer.toViewCategory({ category: 'روغن' })).toEqual({
      item_category: 'روغن',
      item_subcategory: '',
    })
  })
})

describe('WETransformer.toViewGames', () => {
  test('maps the game id to game_name as a number', () => {
    expect(WETransformer.toViewGames(6)).toEqual({ game_name: 6 })
  })
})

describe('WETransformer.toViewCampaign', () => {
  test('maps the campaign id to campaign_name as a number', () => {
    expect(WETransformer.toViewCampaign(1)).toEqual({ campaign_name: 1 })
  })
})

describe('WETransformer.toViewCart', () => {
  test('maps cart lines into item_count, value, and joined item_id', () => {
    expect(
      WETransformer.toViewCart({
        lines: [
          { product: { id: 101 }, quantity: 2 },
          { product: { id: 202 }, quantity: 1 },
        ],
        value: 300_000,
      }),
    ).toEqual({
      item_count: 3,
      value: 300_000,
      item_id: '101,202',
    })
  })
})

describe('WETransformer.toViewCheckout', () => {
  test('maps wallet balance flag and timeslot into the WebEngage payload', () => {
    expect(
      WETransformer.toViewCheckout({
        walletHasBalance: 1,
        timeslot: '۱۰:00 - ۱۲:00',
      }),
    ).toEqual({
      wallet_has_balance: 1,
      timeslot: '۱۰:00 - ۱۲:00',
    })
  })
})

describe('WETransformer.toOrderSubmit', () => {
  test('maps payment method, cart lines, value, and coupon into the payload', () => {
    expect(
      WETransformer.toOrderSubmit({
        paymentMethod: 'ipg',
        lines: [{ product: { id: 101 }, quantity: 2 }],
        value: 200_000,
      }),
    ).toEqual({
      selected_payment_method: 1,
      item_id: '101',
      item_count: 2,
      value: 200_000,
      coupon: '',
    })
  })

  test('maps cod to 2, credit to 3, and missing method to 0', () => {
    expect(
      WETransformer.toOrderSubmit({
        paymentMethod: 'cod',
        lines: [],
        value: 0,
        coupon: 'NEWYEAR2025',
      }),
    ).toMatchObject({ selected_payment_method: 2, coupon: 'NEWYEAR2025' })

    expect(
      WETransformer.toOrderSubmit({
        paymentMethod: 'credit',
        lines: [],
        value: 0,
      }),
    ).toMatchObject({ selected_payment_method: 3 })

    expect(
      WETransformer.toOrderSubmit({
        paymentMethod: null,
        lines: [],
        value: 0,
      }),
    ).toMatchObject({ selected_payment_method: 0 })
  })
})
