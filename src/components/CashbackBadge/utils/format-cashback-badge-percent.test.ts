import { describe, expect, it } from 'vitest'

import { formatCashbackBadgePercent } from './format-cashback-badge-percent'

describe('formatCashbackBadgePercent', () => {
  it('ceilings fractional percents and wraps with Persian digits', () => {
    expect(formatCashbackBadgePercent(5.2)).toBe('٪۶')
    expect(formatCashbackBadgePercent(10)).toBe('٪۱۰')
  })

  it('keeps whole-number percents unchanged aside from digit localization', () => {
    expect(formatCashbackBadgePercent(3)).toBe('٪۳')
  })
})
