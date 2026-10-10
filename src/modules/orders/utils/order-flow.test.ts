import { describe, expect, test } from 'vitest'

import { deriveOrderFlow } from './order-flow'

describe('deriveOrderFlow', () => {
  test('derives standard core flow when payment status does not require online payment', () => {
    const flow = deriveOrderFlow('processing', 'canceled')

    expect(flow).toEqual([
      'pending_approval',
      'processing',
      'delivering',
      'delivered',
    ])
  })

  test('prepends pending_payment step when payment status is paid', () => {
    const flow = deriveOrderFlow('processing', 'paid')

    expect(flow).toEqual([
      'pending_payment',
      'pending_approval',
      'processing',
      'delivering',
      'delivered',
    ])
  })

  test('handles canceled status by resolving fallback flow', () => {
    const flow = deriveOrderFlow('canceled', 'canceled')

    expect(flow).toEqual([
      'pending_approval',
      'processing',
      'delivering',
      'delivered',
    ])
  })
})
