import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { persianDigits } from '@/utils/numbers'

import {
  formatCampaignChargeDate,
  formatCampaignPeriod,
  formatRemainingDaysBadge,
  remainingCampaignDays,
  remainingCampaignFullDays,
} from './campaign-dates'

describe('campaign-dates', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-15T12:00:00+03:30'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('formatCampaignPeriod joins start and end in Persian calendar', () => {
    const period = formatCampaignPeriod(
      '2026-09-01T00:00:00+03:30',
      '2026-09-30T23:59:59+03:30',
    )

    expect(period).toContain(' تا ')
    expect(period.split(' تا ')).toHaveLength(2)
  })

  test('formatCampaignChargeDate includes year', () => {
    const label = formatCampaignChargeDate('2026-09-30T23:59:59+03:30')

    expect(label.length).toBeGreaterThan(0)
    expect(label).toMatch(/\d|[\u06F0-\u06F9]/)
  })

  test('remainingCampaignDays ceils partial days and floors at zero', () => {
    expect(remainingCampaignDays('2026-09-17T12:00:00+03:30')).toBe(2)
    expect(remainingCampaignDays('2026-09-15T18:00:00+03:30')).toBe(1)
    expect(remainingCampaignDays('2026-09-01T00:00:00+03:30')).toBe(0)
    expect(remainingCampaignDays('not-a-date')).toBe(0)
  })

  test('remainingCampaignFullDays floors partial days and floors at zero', () => {
    expect(remainingCampaignFullDays('2026-09-23T22:00:00+03:30')).toBe(8)
    expect(remainingCampaignFullDays('2026-09-15T18:00:00+03:30')).toBe(0)
    expect(remainingCampaignFullDays('2026-09-01T00:00:00+03:30')).toBe(0)
    expect(remainingCampaignFullDays('not-a-date')).toBe(0)
  })

  test('formatRemainingDaysBadge rounds partial days down', () => {
    expect(formatRemainingDaysBadge('2026-09-23T22:00:00+03:30')).toBe(
      `${persianDigits(8)} روز باقی مانده`,
    )
  })

  test('formatRemainingDaysBadge uses Persian digits', () => {
    expect(formatRemainingDaysBadge('2026-09-18T12:00:00+03:30')).toBe(
      `${persianDigits(3)} روز باقی مانده`,
    )
  })
})
