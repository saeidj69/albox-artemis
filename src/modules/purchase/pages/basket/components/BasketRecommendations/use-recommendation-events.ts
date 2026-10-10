'use client'

import { useCallback, useEffect, useRef } from 'react'

import { recordProductRecommendationEventsListing } from '@/api/functions/catalogue'
import type {
  ListingProductRecommendationEvent,
  ListingProductRecommendationEventType,
  ListingProductRecommendationGroupType,
} from '@/api/models'
import { ListingProductRecommendationEventType as EventType } from '@/api/models'
import { MutatorConfig } from '@/api/mutator'

import type { BasketRecommendationItem } from './recommendations'

const MAX_BATCH_SIZE = 50
const EAGER_BATCH_SIZE = 10
const FLUSH_DELAY_MS = 1_500
const RETRY_DELAYS_MS = [300, 900]

const wait = (delay: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, delay))

const occurredAt = () => new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00')

async function deliver(events: ListingProductRecommendationEvent[]) {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await recordProductRecommendationEventsListing({ events }, {
        skipErrorToast: true,
      } as MutatorConfig)
      return
    } catch {
      const retryDelay = RETRY_DELAYS_MS[attempt]
      if (retryDelay == null) return
      await wait(retryDelay)
    }
  }
}

export function useRecommendationEvents(
  recommendationId: string | null,
  recommendationLinePriority: ListingProductRecommendationGroupType,
) {
  const pendingEvents = useRef<ListingProductRecommendationEvent[]>([])
  const impressedProducts = useRef(new Set<string>())
  const flushTimer = useRef<number | null>(null)

  const flush = useCallback(() => {
    if (flushTimer.current) {
      window.clearTimeout(flushTimer.current)
      flushTimer.current = null
    }

    while (pendingEvents.current.length > 0) {
      const events = pendingEvents.current.splice(0, MAX_BATCH_SIZE)
      void deliver(events)
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return
    flushTimer.current = window.setTimeout(flush, FLUSH_DELAY_MS)
  }, [flush])

  const record = useCallback(
    (
      item: BasketRecommendationItem,
      eventType: ListingProductRecommendationEventType,
    ) => {
      if (!recommendationId) return

      if (eventType === EventType.impression) {
        const impressionKey = `${recommendationId}:${item.groupType}:${item.product.id}`
        if (impressedProducts.current.has(impressionKey)) return
        impressedProducts.current.add(impressionKey)
      }

      pendingEvents.current.push({
        eventId: crypto.randomUUID(),
        recommendationId,
        eventType,
        groupType: item.groupType,
        productId: item.product.id,
        position: item.position,
        occurredAt: occurredAt(),
        metadata: {
          presentationSpot: 'basket',
          recommendationLinePriority,
        },
      })

      if (
        eventType !== EventType.impression ||
        pendingEvents.current.length >= EAGER_BATCH_SIZE
      ) {
        flush()
        return
      }

      scheduleFlush()
    },
    [flush, recommendationId, recommendationLinePriority, scheduleFlush],
  )

  useEffect(() => {
    const flushBeforePageSuspends = () => flush()
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flushBeforePageSuspends)
    document.addEventListener('visibilitychange', flushWhenHidden)

    return () => {
      window.removeEventListener('pagehide', flushBeforePageSuspends)
      document.removeEventListener('visibilitychange', flushWhenHidden)
      flush()
    }
  }, [flush])

  return { record }
}
