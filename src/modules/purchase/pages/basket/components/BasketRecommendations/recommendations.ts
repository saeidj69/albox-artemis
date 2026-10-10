import type {
  GetProductRecommendationsListing200,
  ListingProductRecommendationGroupType,
  ListingProductSummary,
} from '@/api/models'
import { ListingProductRecommendationGroupType as GroupType } from '@/api/models'

export const BASKET_RECOMMENDATION_COUNT = 10

export type BasketRecommendationItem = {
  product: ListingProductSummary
  groupType: ListingProductRecommendationGroupType
  position: number
}

export function selectBasketRecommendations(
  response: GetProductRecommendationsListing200 | undefined,
  basketProductIds: ReadonlySet<number>,
  primaryGroup: ListingProductRecommendationGroupType = GroupType.others_also_buy,
): BasketRecommendationItem[] {
  if (!response) return []

  const groups = new Map(response.groups.map((group) => [group.type, group]))
  const selected: BasketRecommendationItem[] = []
  const selectedProductIds = new Set<number>()

  const appendGroup = (groupType: ListingProductRecommendationGroupType) => {
    const group = groups.get(groupType)
    if (!group) return

    for (const [position, product] of group.products.entries()) {
      if (selected.length >= BASKET_RECOMMENDATION_COUNT) return
      if (basketProductIds.has(product.id)) continue
      if (selectedProductIds.has(product.id)) continue

      selected.push({ product, groupType, position })
      selectedProductIds.add(product.id)
    }
  }

  const fallbackGroup =
    primaryGroup === GroupType.others_also_buy
      ? GroupType.recommended_for_you
      : GroupType.others_also_buy

  appendGroup(primaryGroup)
  appendGroup(fallbackGroup)

  return selected
}
