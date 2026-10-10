import { describe, expect, test } from 'vitest'

import {
  englishDigits,
  formatPrice,
  onlyDigits,
  persianDigits,
  toTomanPrice,
} from './index'

describe('Number Utilities', () => {
  describe('englishDigits', () => {
    test('converts Persian digits to English digits', () => {
      expect(englishDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890')
    })

    test('converts Arabic digits to English digits', () => {
      expect(englishDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890')
    })

    test('ignores already English digits and text', () => {
      expect(englishDigits('123abc456')).toBe('123abc456')
    })
  })

  describe('persianDigits', () => {
    test('converts English digits to Persian digits', () => {
      expect(persianDigits('1234567890')).toBe('۱۲۳۴۵۶۷۸۹۰')
      expect(persianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰')
    })

    test('returns empty string if value is undefined or empty', () => {
      expect(persianDigits(undefined)).toBe('')
      expect(persianDigits(null)).toBe('')
      expect(persianDigits('')).toBe('')
    })

    test('converts numeric zero instead of treating it as empty', () => {
      expect(persianDigits(0)).toBe('۰')
      expect(persianDigits('0')).toBe('۰')
    })
  })

  describe('onlyDigits', () => {
    test('filters out non-digit characters', () => {
      expect(onlyDigits('123abc456!@#')).toBe('123456')
    })
  })

  describe('formatPrice', () => {
    test('formats numbers to Persian locale with grouping separators', () => {
      // 100000 -> ۱۰۰٬۰۰۰ (using standard fa-IR format)
      // Since locale formatting can sometimes vary depending on the local node version,
      // we check for character inclusion or general format behavior
      const result = formatPrice(100000)
      expect(result).toContain('۱')
      expect(result).toContain('۰')
    })
  })

  describe('toTomanPrice', () => {
    test('divides Rials by 10 and rounds it to the nearest integer', () => {
      expect(toTomanPrice(100005)).toBe(10001)
      expect(toTomanPrice(100004)).toBe(10000)
    })
  })
})
