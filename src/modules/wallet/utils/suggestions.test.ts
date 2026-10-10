import { describe, expect, test } from 'vitest'

import { getSuggestions } from './suggestions'

describe('getSuggestions', () => {
  test('returns default preset suggestions when input is empty or zero', () => {
    const emptyResult = getSuggestions('')
    expect(emptyResult).toHaveLength(3)
    expect(emptyResult[0].value).toBe(5_000_000)
    expect(emptyResult[1].value).toBe(10_000_000)
    expect(emptyResult[2].value).toBe(15_000_000)

    const zeroResult = getSuggestions('0')
    expect(zeroResult).toEqual(emptyResult)
  })

  test('returns dynamic multiplier suggestions based on non-zero input', () => {
    const suggestions = getSuggestions('50')
    expect(suggestions).toHaveLength(3)
    expect(suggestions[0].value).toBe(50_000)
    expect(suggestions[1].value).toBe(50_000_000)
    expect(suggestions[2].value).toBe(500_000_000)
  })
})
