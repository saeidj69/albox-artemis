import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@/utils/test-utils'

import { ListingProductRecommendationEventType as EventType } from '@/api/models'
import { ListingProductRecommendationGroupType as GroupType } from '@/api/models'

import type { BasketRecommendationItem } from './recommendations'
import { useRecommendationEvents } from './use-recommendation-events'

const sendEvents = vi.fn()

vi.mock('@/api/functions/catalogue', () => ({
  recordProductRecommendationEventsListing: (...args: unknown[]) =>
    sendEvents(...args),
}))

const recommendation: BasketRecommendationItem = {
  product: {
    id: 42,
    name: 'Recommended product',
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
  },
  groupType: 'others_also_buy',
  position: 3,
}

describe('useRecommendationEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sendEvents.mockReset()
    sendEvents.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('batches impressions briefly and records each card once', async () => {
    const { result } = renderHook(() =>
      useRecommendationEvents(
        'b694783b-02c2-408d-8f80-b724702b8153',
        GroupType.recommended_for_you,
      ),
    )

    act(() => {
      result.current.record(recommendation, EventType.impression)
      result.current.record(recommendation, EventType.impression)
    })

    expect(sendEvents).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(1_500))

    expect(sendEvents).toHaveBeenCalledTimes(1)
    expect(sendEvents.mock.calls[0]?.[0].events).toHaveLength(1)
    expect(sendEvents.mock.calls[0]?.[0].events[0]).toMatchObject({
      recommendationId: 'b694783b-02c2-408d-8f80-b724702b8153',
      eventType: EventType.impression,
      groupType: 'others_also_buy',
      productId: 42,
      position: 3,
      metadata: {
        presentationSpot: 'basket',
        recommendationLinePriority: GroupType.recommended_for_you,
      },
    })
    expect(sendEvents.mock.calls[0]?.[0].events[0].occurredAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/,
    )
  })

  it('flushes a high-intent event immediately with queued impressions', async () => {
    const { result } = renderHook(() =>
      useRecommendationEvents(
        'b694783b-02c2-408d-8f80-b724702b8153',
        GroupType.others_also_buy,
      ),
    )

    act(() => {
      result.current.record(recommendation, EventType.impression)
      result.current.record(recommendation, EventType.product_opened)
    })
    await act(() => Promise.resolve())

    expect(sendEvents).toHaveBeenCalledTimes(1)
    expect(
      sendEvents.mock.calls[0]?.[0].events.map(
        (event: { eventType: string }) => event.eventType,
      ),
    ).toEqual([EventType.impression, EventType.product_opened])
  })

  it('tries a failed batch three times without changing its event id', async () => {
    sendEvents.mockRejectedValue(new Error('tracking unavailable'))
    const { result } = renderHook(() =>
      useRecommendationEvents(
        'b694783b-02c2-408d-8f80-b724702b8153',
        GroupType.others_also_buy,
      ),
    )

    act(() => result.current.record(recommendation, EventType.add_to_basket))
    await act(() => vi.runAllTimersAsync())

    expect(sendEvents).toHaveBeenCalledTimes(3)
    const eventIds = sendEvents.mock.calls.map(
      (call) => call[0].events[0].eventId,
    )
    expect(new Set(eventIds).size).toBe(1)
  })

  it('does not send events when the response has no recommendation id', () => {
    const { result } = renderHook(() =>
      useRecommendationEvents(null, GroupType.others_also_buy),
    )

    act(() => result.current.record(recommendation, EventType.product_opened))

    expect(sendEvents).not.toHaveBeenCalled()
  })
})
