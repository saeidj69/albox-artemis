import { describe, expect, test } from 'vitest'

import { parseOrderIdSearch } from './order-search'

describe('parseOrderIdSearch', () => {
  test('parses plain, Persian and Arabic digits into an order id', () => {
    expect(parseOrderIdSearch('1234')).toBe(1234)
    expect(parseOrderIdSearch('۱۲۳۴')).toBe(1234)
    expect(parseOrderIdSearch('١٢٣٤')).toBe(1234)
    expect(parseOrderIdSearch(' 42 ')).toBe(42)
  })

  test('returns undefined for empty input', () => {
    expect(parseOrderIdSearch('')).toBeUndefined()
    expect(parseOrderIdSearch('   ')).toBeUndefined()
  })

  test('returns undefined for free text instead of NaN', () => {
    expect(parseOrderIdSearch('کفش')).toBeUndefined()
    expect(parseOrderIdSearch('abc')).toBeUndefined()
    expect(parseOrderIdSearch('12ab')).toBeUndefined()
    expect(parseOrderIdSearch('-5')).toBeUndefined()
    expect(parseOrderIdSearch('1.5')).toBeUndefined()
  })

  test('returns undefined for ids beyond the safe integer range', () => {
    expect(parseOrderIdSearch('99999999999999999999')).toBeUndefined()
  })
})
