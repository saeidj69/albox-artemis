import { describe, expect, test } from 'vitest'

import {
  composeIsoDateTime,
  formatJalaliDayMonth,
  formatJalaliHour,
  formatJalaliHourRange,
  formatJalaliLongDate,
  formatJalaliLongDateTime,
  formatJalaliTimeslot,
} from './index'

describe('Jalali Date Utilities', () => {
  // 2026-03-21 corresponds to 1 Farvardin 1405 (Jalali New Year / Nowruz)
  // March 21, 2026 is Saturday ("شنبه")
  const testDate = new Date('2026-03-21T12:00:00')

  describe('formatJalaliLongDate', () => {
    test('formats Gregorian date into long Jalali date', () => {
      const result = formatJalaliLongDate(testDate)
      // Saturday, 1 Farvardin -> شنبه، ۱ فروردین (Intl formats might contain different invisible spaces, so we assert substrings)
      expect(result).toContain('شنبه')
      expect(result).toContain('۱')
      expect(result).toContain('فروردین')
    })
  })

  describe('formatJalaliDayMonth', () => {
    test('formats date into Jalali day and month', () => {
      const result = formatJalaliDayMonth(testDate)
      // 1 Farvardin -> ۱ فروردین
      expect(result).toContain('۱')
      expect(result).toContain('فروردین')
      expect(result).not.toContain('شنبه')
    })
  })

  describe('formatJalaliLongDateTime', () => {
    test('formats date into long Jalali date and time', () => {
      const result = formatJalaliLongDateTime(testDate)
      // Should include weekday, year (۱۴۰۵), and time (۱۲:۰۰)
      expect(result).toContain('شنبه')
      expect(result).toContain('۱۴۰۵')
      expect(result).toContain('۱۲:۰۰')
    })
  })

  describe('formatJalaliHour', () => {
    test('formats the hour of a date to Persian digits and pads it', () => {
      expect(formatJalaliHour(testDate)).toBe('۱۲:00')

      const earlyDate = new Date('2026-03-21T05:30:00')
      expect(formatJalaliHour(earlyDate)).toBe('۰۵:00')
    })
  })

  describe('formatJalaliTimeslot', () => {
    test('formats a range of hours into a time slot string', () => {
      const start = new Date('2026-03-21T09:00:00')
      const end = new Date('2026-03-21T13:00:00')
      expect(formatJalaliTimeslot(start, end)).toContain('۰۹:00')
      expect(formatJalaliTimeslot(start, end)).toContain('۱۳:00')
    })
  })

  describe('formatJalaliHourRange', () => {
    test('formats start and end hours with "تا"', () => {
      const start = new Date('2026-03-21T10:00:00')
      const end = new Date('2026-03-21T17:00:00')
      const result = formatJalaliHourRange(start, end)
      expect(result).toContain('۱۰')
      expect(result).toContain('تا')
      expect(result).toContain('۱۷')
    })
  })

  describe('composeIsoDateTime', () => {
    test('concatenates date and time with T separator', () => {
      expect(composeIsoDateTime('2026-03-21', '12:00:00')).toBe(
        '2026-03-21T12:00:00',
      )
    })
  })
})
