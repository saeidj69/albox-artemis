import { describe, expect, it } from 'vitest'

import { getBasketLineKey } from '../types'
import type { BasketLine, ProductBasketLine } from '../types'
import {
  addLineToList,
  removeLineFromList,
  setQuantityInList,
} from './basket-line-operations'

const productLine = (
  overrides: Partial<ProductBasketLine> & Pick<ProductBasketLine, 'productId'>,
): ProductBasketLine => ({
  type: 'product',
  productId: overrides.productId,
  quantity: overrides.quantity ?? 1,
  title: overrides.title ?? 'Product',
  priceWhenAdded: overrides.priceWhenAdded ?? 10000,
  addedAt: overrides.addedAt ?? 1_700_000_000_000,
})

describe('getBasketLineKey', () => {
  it('formats product and bundle keys with type prefix', () => {
    expect(
      getBasketLineKey({
        type: 'product',
        productId: 5,
        quantity: 1,
        title: 'A',
        priceWhenAdded: 1,
      }),
    ).toBe('product:5')

    expect(
      getBasketLineKey({
        type: 'bundle',
        bundleId: 5,
        quantity: 1,
        title: 'B',
        priceWhenAdded: 1,
      }),
    ).toBe('bundle:5')
  })
})

describe('addLineToList', () => {
  it('appends a new line and stamps addedAt', () => {
    const before = Date.now()
    const result = addLineToList([], {
      type: 'product',
      productId: 10,
      quantity: 2,
      title: 'Soap',
      priceWhenAdded: 50000,
    })
    const after = Date.now()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      type: 'product',
      productId: 10,
      quantity: 2,
      title: 'Soap',
      priceWhenAdded: 50000,
    })
    expect(result[0].addedAt).toBeGreaterThanOrEqual(before)
    expect(result[0].addedAt).toBeLessThanOrEqual(after)
  })

  it('bumps quantity and overwrites price/title for an existing (type, id)', () => {
    const existing = productLine({
      productId: 10,
      quantity: 2,
      title: 'Old',
      priceWhenAdded: 10000,
      addedAt: 100,
    })

    const result = addLineToList([existing], {
      type: 'product',
      productId: 10,
      quantity: 3,
      title: 'New',
      priceWhenAdded: 20000,
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      ...existing,
      quantity: 5,
      title: 'New',
      priceWhenAdded: 20000,
    })
  })

  it('treats product:5 and bundle:5 as distinct lines', () => {
    const product = productLine({ productId: 5, quantity: 1 })
    const result = addLineToList([product], {
      type: 'bundle',
      bundleId: 5,
      quantity: 2,
      title: 'Bundle',
      priceWhenAdded: 30000,
    })

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(product)
    expect(result[1]).toMatchObject({
      type: 'bundle',
      bundleId: 5,
      quantity: 2,
    })
  })
})

describe('removeLineFromList', () => {
  it('removes the matching key', () => {
    const lines: BasketLine[] = [
      productLine({ productId: 1 }),
      productLine({ productId: 2 }),
    ]

    expect(removeLineFromList(lines, 'product:1')).toEqual([lines[1]])
  })

  it('no-ops when the key is missing', () => {
    const lines: BasketLine[] = [productLine({ productId: 1 })]
    expect(removeLineFromList(lines, 'product:99')).toEqual(lines)
  })
})

describe('setQuantityInList', () => {
  it('updates quantity for the matching key', () => {
    const lines: BasketLine[] = [productLine({ productId: 1, quantity: 2 })]

    expect(setQuantityInList(lines, 'product:1', 5)).toEqual([
      { ...lines[0], quantity: 5 },
    ])
  })

  it('removes the line when quantity is 0 or below', () => {
    const lines: BasketLine[] = [
      productLine({ productId: 1, quantity: 2 }),
      productLine({ productId: 2, quantity: 1 }),
    ]

    expect(setQuantityInList(lines, 'product:1', 0)).toEqual([lines[1]])
    expect(setQuantityInList(lines, 'product:2', -1)).toEqual([lines[0]])
  })
})
