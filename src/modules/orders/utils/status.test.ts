import { describe, expect, test } from 'vitest'

import { getOrderStatusChipClassNames, getOrderStatusTone } from './status'

describe('orders status utils', () => {
  test('returns correct tone for each simplified order status', () => {
    expect(getOrderStatusTone('delivered')).toBe('success')
    expect(getOrderStatusTone('canceled')).toBe('error')
    expect(getOrderStatusTone('delivering')).toBe('info')
    expect(getOrderStatusTone('processing')).toBe('info')
    expect(getOrderStatusTone('pending_approval')).toBe('info')
    expect(getOrderStatusTone('pending_customer_approval')).toBe('warning')
    expect(getOrderStatusTone('pending_payment')).toBe('warning')
  })

  test('returns chip class names matching status tone', () => {
    const successClasses = getOrderStatusChipClassNames('delivered')
    expect(successClasses.root).toContain('bg-success-light')
    expect(successClasses.content).toContain('text-success-dark')

    const errorClasses = getOrderStatusChipClassNames('canceled')
    expect(errorClasses.root).toContain('bg-error-lighter')
    expect(errorClasses.content).toContain('text-error-dark')
  })
})
