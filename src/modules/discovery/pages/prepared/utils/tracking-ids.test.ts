import { describe, expect, test } from 'vitest'

import {
  childTrackingId,
  NMV_ROW_TRACKING_ID,
  NMV_TRACKING_ID,
  rowTrackingId,
  SURENA_ROW_TRACKING_ID,
  SURENA_TRACKING_ID,
  widgetTrackingId,
} from './tracking-ids'

describe('tracking ids', () => {
  test('builds readable row, widget and child ids', () => {
    expect(rowTrackingId({ position: 3 })).toBe('row-3')
    expect(widgetTrackingId({ type: 'banner', id: 17 })).toBe('banner-17')
    expect(childTrackingId('banner-17', 'slide', 0)).toBe('banner-17-slide-0')
    expect(childTrackingId('products_cart-41', 'product', 88)).toBe(
      'products_cart-41-product-88',
    )
  })

  test('is stable for the same input and distinct across widgets', () => {
    const a = widgetTrackingId({ type: 'banner', id: 1 })
    expect(widgetTrackingId({ type: 'banner', id: 1 })).toBe(a)
    expect(widgetTrackingId({ type: 'banner', id: 2 })).not.toBe(a)
    expect(widgetTrackingId({ type: 'products_cart', id: 1 })).not.toBe(a)
  })

  test('surena ids never collide with a real row or widget', () => {
    expect(SURENA_ROW_TRACKING_ID).not.toBe(rowTrackingId({ position: 0 }))
    expect(SURENA_TRACKING_ID).not.toMatch(/-\d+$/)
  })

  test('nmv ids never collide with surena or a real row', () => {
    expect(NMV_ROW_TRACKING_ID).not.toBe(SURENA_ROW_TRACKING_ID)
    expect(NMV_ROW_TRACKING_ID).not.toBe(rowTrackingId({ position: 0 }))
    expect(NMV_TRACKING_ID).not.toBe(SURENA_TRACKING_ID)
    expect(NMV_TRACKING_ID).not.toMatch(/-\d+$/)
  })
})
