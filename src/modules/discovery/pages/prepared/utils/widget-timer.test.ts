import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  resolveWidgetCountdown,
  WIDGET_TIMER_COUNTDOWN,
  WIDGET_TIMER_ENDS_AT_KEY,
  WIDGET_TIMER_KEY,
} from './widget-timer'

const ENDS_AT = '2026-10-01T18:00:00+03:30'

describe('resolveWidgetCountdown', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('returns the deadline when the preset and date are valid', () => {
    expect(
      resolveWidgetCountdown({
        [WIDGET_TIMER_KEY]: WIDGET_TIMER_COUNTDOWN,
        [WIDGET_TIMER_ENDS_AT_KEY]: ENDS_AT,
      }),
    ).toEqual({ endsAt: Date.parse(ENDS_AT) })
  })

  test('still returns an already-passed deadline so the widget can expire live', () => {
    const past = '2020-01-01T00:00:00+03:30'

    expect(
      resolveWidgetCountdown({
        [WIDGET_TIMER_KEY]: WIDGET_TIMER_COUNTDOWN,
        [WIDGET_TIMER_ENDS_AT_KEY]: past,
      }),
    ).toEqual({ endsAt: Date.parse(past) })
  })

  test('returns undefined when the timer preset is absent', () => {
    expect(
      resolveWidgetCountdown({ [WIDGET_TIMER_ENDS_AT_KEY]: ENDS_AT }),
    ).toBeUndefined()
  })

  test('returns undefined for an unknown timer preset', () => {
    expect(
      resolveWidgetCountdown({
        [WIDGET_TIMER_KEY]: 'flip',
        [WIDGET_TIMER_ENDS_AT_KEY]: ENDS_AT,
      }),
    ).toBeUndefined()
  })

  test('returns undefined when the deadline is missing or unparseable', () => {
    expect(
      resolveWidgetCountdown({ [WIDGET_TIMER_KEY]: WIDGET_TIMER_COUNTDOWN }),
    ).toBeUndefined()

    expect(
      resolveWidgetCountdown({
        [WIDGET_TIMER_KEY]: WIDGET_TIMER_COUNTDOWN,
        [WIDGET_TIMER_ENDS_AT_KEY]: 'فردا',
      }),
    ).toBeUndefined()
  })

  test('returns undefined when presentations are flagged off', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')

    expect(
      resolveWidgetCountdown({
        [WIDGET_TIMER_KEY]: WIDGET_TIMER_COUNTDOWN,
        [WIDGET_TIMER_ENDS_AT_KEY]: ENDS_AT,
      }),
    ).toBeUndefined()
  })
})
