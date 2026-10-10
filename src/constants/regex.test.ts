import { describe, expect, test } from 'vitest'

import {
  DigitsOnlyRegExp,
  NationalIdRegExp,
  OtpRegExp,
  PhoneNumberRegExp,
  PostalCodeRegExp,
} from './regex'

describe('Validation Regex Rules', () => {
  describe('PhoneNumberRegExp', () => {
    test('matches valid English phone numbers', () => {
      expect(PhoneNumberRegExp.test('09123456789')).toBe(true)
      expect(PhoneNumberRegExp.test('09901234567')).toBe(true)
    })

    test('matches valid Persian phone numbers', () => {
      expect(PhoneNumberRegExp.test('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true)
      expect(PhoneNumberRegExp.test('۰۹۹۰۱۲۳۴۵۶۷')).toBe(true)
    })

    test('matches phone numbers with dashes', () => {
      expect(PhoneNumberRegExp.test('0912-345-6789')).toBe(true)
    })

    test('rejects invalid phone numbers', () => {
      expect(PhoneNumberRegExp.test('19123456789')).toBe(false) // does not start with 0/۰
      expect(PhoneNumberRegExp.test('08123456789')).toBe(false) // third digit is not 0-3 or 9
      expect(PhoneNumberRegExp.test('0912345678')).toBe(false) // too short
      expect(PhoneNumberRegExp.test('091234567890')).toBe(false) // too long
    })
  })

  describe('OtpRegExp', () => {
    test('matches 5-digit OTP codes in English and Persian', () => {
      expect(OtpRegExp.test('12345')).toBe(true)
      expect(OtpRegExp.test('۱۲۳۴۵')).toBe(true)
    })

    test('rejects invalid OTP codes', () => {
      expect(OtpRegExp.test('1234')).toBe(false)
      expect(OtpRegExp.test('123456')).toBe(false)
      expect(OtpRegExp.test('123a5')).toBe(false)
    })
  })

  describe('NationalIdRegExp', () => {
    test('matches 10-digit National IDs in English', () => {
      expect(NationalIdRegExp.test('0123456789')).toBe(true)
    })

    test('rejects invalid National IDs', () => {
      expect(NationalIdRegExp.test('123456789')).toBe(false) // 9 digits
      expect(NationalIdRegExp.test('01234567890')).toBe(false) // 11 digits
      expect(NationalIdRegExp.test('012345678a')).toBe(false)
    })
  })

  describe('DigitsOnlyRegExp', () => {
    test('matches only digits in English and Persian', () => {
      expect(DigitsOnlyRegExp.test('1234567890')).toBe(true)
      expect(DigitsOnlyRegExp.test('۱۲۳۴۵۶۷۸۹۰')).toBe(true)
      expect(DigitsOnlyRegExp.test('123۴۵۶')).toBe(true)
    })

    test('rejects digits mixed with other characters', () => {
      expect(DigitsOnlyRegExp.test('123a45')).toBe(false)
      expect(DigitsOnlyRegExp.test('123-456')).toBe(false)
    })
  })

  describe('PostalCodeRegExp', () => {
    test('matches 10-digit postal codes in English and Persian', () => {
      expect(PostalCodeRegExp.test('1234567890')).toBe(true)
      expect(PostalCodeRegExp.test('۱۲۳۴۵۶۷۸۹۰')).toBe(true)
    })

    test('rejects invalid postal codes', () => {
      expect(PostalCodeRegExp.test('123456789')).toBe(false)
      expect(PostalCodeRegExp.test('12345678901')).toBe(false)
    })
  })
})
