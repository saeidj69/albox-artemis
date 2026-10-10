import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  calculateCashbackAmount,
  getEnvCashbackPercent,
  parseCashbackPercent,
  selectCashbackPercent,
} from './cashback'

describe('parseCashbackPercent', () => {
  it('returns undefined when the value is missing or blank', () => {
    expect(parseCashbackPercent(undefined)).toBeUndefined()
    expect(parseCashbackPercent(null)).toBeUndefined()
    expect(parseCashbackPercent('')).toBeUndefined()
    expect(parseCashbackPercent('   ')).toBeUndefined()
  })

  it('returns undefined when the value is not a finite positive number', () => {
    expect(parseCashbackPercent('0')).toBeUndefined()
    expect(parseCashbackPercent('-2')).toBeUndefined()
    expect(parseCashbackPercent('abc')).toBeUndefined()
  })

  it('returns the parsed number when it is greater than 0', () => {
    expect(parseCashbackPercent('2')).toBe(2)
    expect(parseCashbackPercent('1.5')).toBe(1.5)
    expect(parseCashbackPercent('2.5')).toBe(2.5)
  })
})

describe('getEnvCashbackPercent', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads CASHBACK_PERCENT from the environment at call time', () => {
    vi.stubEnv('CASHBACK_PERCENT', '2')
    expect(getEnvCashbackPercent()).toBe(2)
  })

  it('returns undefined when the env value is missing or not positive', () => {
    vi.stubEnv('CASHBACK_PERCENT', '')
    expect(getEnvCashbackPercent()).toBeUndefined()

    vi.stubEnv('CASHBACK_PERCENT', '0')
    expect(getEnvCashbackPercent()).toBeUndefined()
  })
})

describe('calculateCashbackAmount', () => {
  it('returns rounded cashback from discounted unit price', () => {
    expect(calculateCashbackAmount(10_000, 5)).toBe(500)
  })

  it('returns null when percent is missing', () => {
    expect(calculateCashbackAmount(10_000, null)).toBeNull()
    expect(calculateCashbackAmount(10_000, undefined)).toBeNull()
  })

  it('returns null when percent is zero or negative', () => {
    expect(calculateCashbackAmount(10_000, 0)).toBeNull()
    expect(calculateCashbackAmount(10_000, -3)).toBeNull()
  })

  it('rounds to the nearest integer', () => {
    expect(calculateCashbackAmount(9_999, 3)).toBe(300)
  })
})

describe('selectCashbackPercent', () => {
  it('returns percent when product is available and percent is positive', () => {
    expect(selectCashbackPercent(true, 5)).toBe(5)
  })

  it('returns undefined when product is unavailable', () => {
    expect(selectCashbackPercent(false, 5)).toBeUndefined()
  })

  it('returns undefined for null, zero, or negative percent', () => {
    expect(selectCashbackPercent(true, null)).toBeUndefined()
    expect(selectCashbackPercent(true, 0)).toBeUndefined()
    expect(selectCashbackPercent(true, -1)).toBeUndefined()
  })
})
