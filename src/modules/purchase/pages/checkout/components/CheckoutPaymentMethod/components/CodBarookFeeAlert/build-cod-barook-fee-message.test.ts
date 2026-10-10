import { describe, expect, test } from 'vitest'

import {
  buildCodBarookFeeMessage,
  COD_BAROOK_FEE_FALLBACK_MESSAGE,
} from './build-cod-barook-fee-message'

describe('buildCodBarookFeeMessage', () => {
  test('returns numbered copy when a commission percentage is provided', () => {
    expect(buildCodBarookFeeMessage(5)).toBe(
      'در صورت پرداخت با اعتبار باروک، ۵٪ از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.',
    )
  })

  test('formats decimal percentages with persian digits', () => {
    expect(buildCodBarookFeeMessage(3.25)).toBe(
      'در صورت پرداخت با اعتبار باروک، ۳.۲۵٪ از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.',
    )
  })

  test('returns fallback copy when percentage is missing or invalid', () => {
    expect(buildCodBarookFeeMessage()).toBe(COD_BAROOK_FEE_FALLBACK_MESSAGE)
    expect(buildCodBarookFeeMessage(Number.NaN)).toBe(
      COD_BAROOK_FEE_FALLBACK_MESSAGE,
    )
  })
})
