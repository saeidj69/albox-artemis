import { describe, expect, it } from 'vitest'

import type {
  GetProductRecommendationsListing200,
  ListingProductSummary,
} from '@/api/models'
import { ListingProductRecommendationGroupType as GroupType } from '@/api/models'

import {
  BASKET_RECOMMENDATION_COUNT,
  selectBasketRecommendations,
} from './recommendations'

const product = (id: number): ListingProductSummary => ({
  id,
  name: `Product ${id}`,
  isPromoted: false,
  purchasableQuantity: 10,
  unitInBox: 1,
  boxRetailPrice: 100,
  boxDiscountedPrice: 90,
  unitRetailPrice: 100,
  unitDiscountedPrice: 90,
  unitDiscountAmount: 10,
  totalDiscount: 10,
  totalDiscountAmount: 10,
  totalCashback: 0,
  totalCashbackAmount: 0,
  category: { id: 1, name: 'Category', parentId: null },
  brand: {
    id: 1,
    name: 'Brand',
    manufacturer: { id: 1, name: 'Manufacturer' },
  },
  images: [],
  stepDiscounts: [],
})

const response = (
  basketIds: number[],
  generalIds: number[],
): GetProductRecommendationsListing200 => ({
  groups: [
    {
      type: GroupType.recommended_for_you,
      products: generalIds.map(product),
    },
    {
      type: GroupType.others_also_buy,
      products: basketIds.map(product),
    },
  ],
  metadata: {
    recommendationId: 'b694783b-02c2-408d-8f80-b724702b8153',
    modelVersion: '1',
    generatedAt: null,
  },
})

describe('selectBasketRecommendations', () => {
  it('keeps basket recommendations first and fills to ten from general recommendations', () => {
    const result = selectBasketRecommendations(
      response([1, 2, 3], [4, 5, 6, 7, 8, 9, 10, 11, 12]),
      new Set(),
    )

    expect(result).toHaveLength(BASKET_RECOMMENDATION_COUNT)
    expect(result.map((item) => item.product.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
    expect(
      result
        .slice(0, 3)
        .every((item) => item.groupType === GroupType.others_also_buy),
    ).toBe(true)
    expect(result[3]).toMatchObject({
      groupType: GroupType.recommended_for_you,
      position: 0,
    })
  })

  it('keeps personal recommendations first in variant B and fills from basket recommendations', () => {
    const result = selectBasketRecommendations(
      response([4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3]),
      new Set(),
      GroupType.recommended_for_you,
    )

    expect(result).toHaveLength(BASKET_RECOMMENDATION_COUNT)
    expect(result.map((item) => item.product.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
    expect(
      result
        .slice(0, 3)
        .every((item) => item.groupType === GroupType.recommended_for_you),
    ).toBe(true)
    expect(result[3]).toMatchObject({
      groupType: GroupType.others_also_buy,
      position: 0,
    })
  })

  it('filters current basket products and deduplicates fallback products', () => {
    const result = selectBasketRecommendations(
      response([1, 2, 3], [2, 3, 4, 5]),
      new Set([1]),
    )

    expect(result.map((item) => item.product.id)).toEqual([2, 3, 4, 5])
    expect(result.find((item) => item.product.id === 2)?.groupType).toBe(
      GroupType.others_also_buy,
    )
  })

  it('returns an empty list when the API has no recommendations', () => {
    expect(selectBasketRecommendations(response([], []), new Set())).toEqual([])
  })
})
