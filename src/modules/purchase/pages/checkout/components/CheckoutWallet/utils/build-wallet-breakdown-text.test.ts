import { describe, expect, test } from 'vitest'

import { buildWalletBreakdownText } from './build-wallet-breakdown-text'

describe('buildWalletBreakdownText', () => {
  test('returns an empty list when every amount is zero', () => {
    expect(
      buildWalletBreakdownText({
        giftAmount: 0,
        chargeAmount: 0,
        barookAmount: 0,
      }),
    ).toEqual([])
  })

  test('orders barook first, then gift, then charge', () => {
    expect(
      buildWalletBreakdownText({
        giftAmount: 1_000,
        chargeAmount: 2_000,
        barookAmount: 3_000,
      }),
    ).toEqual([
      { amount: 3_000, title: 'کیف پول‌ باروک' },
      { amount: 1_000, title: 'هدیه' },
      { amount: 2_000, title: 'شارژ کیف پول' },
    ])
  })

  test('omits parts whose amount is zero', () => {
    expect(
      buildWalletBreakdownText({
        giftAmount: 0,
        chargeAmount: 5_000,
        barookAmount: 0,
      }),
    ).toEqual([{ amount: 5_000, title: 'شارژ کیف پول' }])
  })

  test('ignores negative amounts', () => {
    expect(
      buildWalletBreakdownText({
        giftAmount: -100,
        chargeAmount: 0,
        barookAmount: 0,
      }),
    ).toEqual([])
  })
})
