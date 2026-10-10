import { describe, expect, test } from 'vitest'

import {
  BRAND_SWATCHES,
  isBrandSwatchFill,
  sanitizeBrandSwatch,
} from './brand-swatches'

describe('sanitizeBrandSwatch', () => {
  test('returns the canonical hex for every swatch', () => {
    for (const swatch of BRAND_SWATCHES) {
      expect(sanitizeBrandSwatch(swatch.toLowerCase())).toBe(swatch)
    }
  })

  test('returns undefined for an unknown color', () => {
    expect(sanitizeBrandSwatch('#ffffff')).toBeUndefined()
  })
})

describe('isBrandSwatchFill', () => {
  test('matches hex and rgb forms of a brand fill', () => {
    expect(isBrandSwatchFill('#11A64A')).toBe(true)
    expect(isBrandSwatchFill('#11a64a')).toBe(true)
    expect(isBrandSwatchFill('rgba(17, 166, 74, 1)')).toBe(true)
  })

  test('rejects other solids and gradients', () => {
    expect(isBrandSwatchFill('#ffffff')).toBe(false)
    expect(isBrandSwatchFill('linear-gradient(90deg, #11A64A, #ffffff)')).toBe(
      false,
    )
  })
})
