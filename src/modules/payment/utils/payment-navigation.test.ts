import { ROUTES } from '@/constants'
import { describe, expect, it, vi } from 'vitest'

import { buildOrderPayUrl, buildPaymentResultUrl } from './payment-navigation'

const API_URL = 'https://jupiter.allbox.work'

const getApiUrl = vi.hoisted(() => vi.fn())

vi.mock('@/config/environment', () => ({
  environmentManager: { getApiUrl },
}))

describe('buildOrderPayUrl', () => {
  it('builds an absolute Jupiter pay URL for the order reference entity', () => {
    getApiUrl.mockReturnValue(API_URL)

    expect(buildOrderPayUrl(1234)).toBe(
      'https://jupiter.allbox.work/payment/payments/order/pay/1234',
    )
  })

  it('treats a string order id the same as a numeric one', () => {
    getApiUrl.mockReturnValue(API_URL)

    expect(buildOrderPayUrl('1234')).toBe(buildOrderPayUrl(1234))
  })

  it('produces a URL the browser can navigate to without further resolution', () => {
    getApiUrl.mockReturnValue(API_URL)

    const parsed = new URL(buildOrderPayUrl(1234))

    expect(parsed.origin).toBe(API_URL)
    expect(parsed.search).toBe('')
  })

  it('falls back to an app-relative path when no API URL is available', () => {
    getApiUrl.mockReturnValue('')

    expect(buildOrderPayUrl(1234)).toBe('/payment/payments/order/pay/1234')
  })
})

describe('buildPaymentResultUrl', () => {
  it('includes status, type, and referenceId for a local Barook completion', () => {
    expect(
      buildPaymentResultUrl({
        status: 'success',
        type: 'barook',
        referenceId: '42',
      }),
    ).toBe(`${ROUTES.PAYMENT.RESULT}?status=success&type=barook&referenceId=42`)
  })
})
