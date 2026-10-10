'use client'

import { useMemo, useState } from 'react'

import Image from 'next/image'

import { useProductListTracking } from '@/hooks/useProductListTracking'
import { useQuery } from '@tanstack/react-query'

import HorizontalProductList from '@/components/HorizontalProductList'

import { useLocation } from '@/modules/addresses/hooks'
import { EXPERIMENTS, useExperiment } from '@/modules/experiments'
import { useBasket, useBasketAlerts } from '@/modules/purchase/hooks'

import { getProductRecommendationsListing } from '@/api/functions/catalogue'
import { ListingProductRecommendationEventType as EventType } from '@/api/models'
import { ListingProductRecommendationGroupType as GroupType } from '@/api/models'
import { MutatorConfig } from '@/api/mutator'

import {
  selectBasketRecommendations,
  type BasketRecommendationItem,
} from './recommendations'
import { useRecommendationEvents } from './use-recommendation-events'

const MAX_BASKET_PRODUCT_IDS = 100

type BasketRecommendationSessionProps = {
  basketProductIds: number[]
}

const BasketRecommendationSession = ({
  basketProductIds,
}: BasketRecommendationSessionProps) => {
  const { location, isLoading: isLocationLoading } = useLocation()
  const titleVariant = useExperiment(EXPERIMENTS.BASKET_RECOMMENDATION_TITLE)
  const orderVariant = useExperiment(EXPERIMENTS.BASKET_RECOMMENDATION_ORDER)
  const [recommendationSessionId] = useState(() => crypto.randomUUID())

  const [basketProductIdsAtEntry] = useState(() => basketProductIds)
  const requestedBasketProductIds = useMemo(
    () => basketProductIdsAtEntry.slice(0, MAX_BASKET_PRODUCT_IDS),
    [basketProductIdsAtEntry],
  )

  const recommendationsQuery = useQuery({
    queryKey: [
      'basket-product-recommendations',
      recommendationSessionId,
      location.latitude,
      location.longitude,
      requestedBasketProductIds,
    ],
    queryFn: ({ signal }) =>
      getProductRecommendationsListing(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          basketProductIds: requestedBasketProductIds,
        },
        { signal, skipErrorToast: true } as MutatorConfig,
      ),
    enabled: !isLocationLoading && requestedBasketProductIds.length > 0,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const basketProductIdSet = useMemo(
    () => new Set(basketProductIdsAtEntry),
    [basketProductIdsAtEntry],
  )
  const recommendationLinePriority =
    orderVariant?.payload?.primaryGroup ?? GroupType.others_also_buy
  const recommendationItems = useMemo(
    () =>
      selectBasketRecommendations(
        recommendationsQuery.data,
        basketProductIdSet,
        recommendationLinePriority,
      ),
    [basketProductIdSet, recommendationLinePriority, recommendationsQuery.data],
  )
  const recommendationTitleVariant =
    titleVariant?.payload?.title ?? 'dont_miss_out'

  const { record } = useRecommendationEvents(
    recommendationsQuery.data?.metadata.recommendationId ?? null,
    recommendationLinePriority,
  )

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: 'basket-recommendations',
    itemListName: 'basket-recommendations',
  })

  const recordForItem = (
    item: BasketRecommendationItem | undefined,
    eventType: (typeof EventType)[keyof typeof EventType],
  ) => {
    if (!item) return

    record(item, eventType)
  }

  if (recommendationItems.length === 0) return null

  const showAiTitle = recommendationTitleVariant === 'ai'
  const recommendationTitle = showAiTitle ? (
    <span className="flex items-center gap-2">
      <Image
        data-slot="basket-recommendations-ai-icon"
        src="/images/allbox-ai-robot-animated-min.svg"
        alt=""
        width={44}
        height={44}
        unoptimized
      />
      <span>پیشنهاد هوش مصنوعی آل‌باکس به شما</span>
    </span>
  ) : recommendationTitleVariant === 'popular_nearby' ? (
    'این کالاها بین فروشگاه‌های اطراف شما پرطرفدارند'
  ) : (
    'از دستت نره!'
  )

  return (
    <div data-slot="basket-recommendations">
      <HorizontalProductList
        title={recommendationTitle}
        products={recommendationItems.map((item) => item.product)}
        getProductKey={(product) =>
          `${recommendationsQuery.data?.metadata.recommendationId ?? 'anonymous'}:${product.id}`
        }
        onProductFullyVisible={(_, index) => {
          recordForItem(recommendationItems[index], EventType.impression)
          onProductVisible(recommendationItems[index].product, index)
        }}
        onProductOpen={(_, index) => {
          recordForItem(recommendationItems[index], EventType.product_opened)
          onProductOpen(recommendationItems[index].product, index)
        }}
        onProductFirstAdd={(_, index) =>
          recordForItem(recommendationItems[index], EventType.add_to_basket)
        }
      />
    </div>
  )
}

const BasketRecommendations = () => {
  const { productLines } = useBasket()
  const { hasError } = useBasketAlerts()
  const basketProductIds = useMemo(
    () =>
      productLines
        .map((line) => line.productId)
        .sort((left, right) => left - right),
    [productLines],
  )

  if (basketProductIds.length === 0 || hasError) return null

  return <BasketRecommendationSession basketProductIds={basketProductIds} />
}

export default BasketRecommendations
