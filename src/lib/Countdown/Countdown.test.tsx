import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { act, render } from '@/utils/test-utils'

import Countdown from './Countdown'
import { toCountdownSegments } from './useCountdown'

const NOW = Date.parse('2026-10-01T12:00:00+03:30')

const HOUR = 3600
const DAY = 24 * HOUR

const segmentValues = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="flip-digits"]')).map(
    (node) => Number(node.getAttribute('data-value')),
  )

describe('toCountdownSegments', () => {
  test('uses hours, minutes and seconds below a day', () => {
    expect(toCountdownSegments(2 * HOUR + 3 * 60 + 4)).toEqual({
      values: [2, 3, 4],
      withDays: false,
    })
  })

  test('uses days, hours and minutes from a day upwards', () => {
    expect(toCountdownSegments(DAY)).toEqual({
      values: [1, 0, 0],
      withDays: true,
    })
    expect(toCountdownSegments(3 * DAY + 5 * HOUR + 7 * 60 + 30)).toEqual({
      values: [3, 5, 7],
      withDays: true,
    })
  })
})

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('renders hours, minutes and seconds under a day', () => {
    const { container } = render(
      <Countdown endsAt={NOW + (2 * HOUR + 3 * 60 + 4) * 1000} />,
    )

    expect(segmentValues(container)).toEqual([2, 3, 4])
    expect(
      container.querySelectorAll('[data-slot="flip-digits-digit"]'),
    ).toHaveLength(6)
    expect(container.querySelector('[data-slot="countdown"]')).toHaveAttribute(
      'aria-label',
      '02:03:04',
    )
  })

  test('renders days, hours and minutes past a day', () => {
    const { container } = render(
      <Countdown endsAt={NOW + (3 * DAY + 5 * HOUR + 7 * 60) * 1000} />,
    )

    expect(segmentValues(container)).toEqual([3, 5, 7])
  })

  test('ticks down once a second', () => {
    const { container } = render(<Countdown endsAt={NOW + 65 * 1000} />)

    expect(segmentValues(container)).toEqual([0, 1, 5])

    act(() => vi.advanceTimersByTime(5000))

    expect(segmentValues(container)).toEqual([0, 1, 0])
  })

  test('renders nothing once the deadline has already passed', () => {
    const { container } = render(<Countdown endsAt={NOW - 1000} />)

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).not.toBeInTheDocument()
  })

  test('disappears when the deadline is reached while mounted', () => {
    const { container } = render(<Countdown endsAt={NOW + 2000} />)

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2000))

    expect(
      container.querySelector('[data-slot="countdown"]'),
    ).not.toBeInTheDocument()
  })

  test('keeps the clock order left-to-right inside the RTL layout', () => {
    const { container } = render(<Countdown endsAt={NOW + 60 * 1000} />)

    expect(container.querySelector('[data-slot="countdown"]')).toHaveAttribute(
      'dir',
      'ltr',
    )
    container.querySelectorAll('[data-slot="flip-digits"]').forEach((node) => {
      expect(node).toHaveAttribute('dir', 'rtl')
    })
  })

  test('forwards a per-slot class to the separators', () => {
    const { container } = render(
      <Countdown
        endsAt={NOW + 60 * 1000}
        classNames={{ separator: 'text-white' }}
      />,
    )

    const separators = container.querySelectorAll(
      '[data-slot="countdown-separator"]',
    )

    expect(separators).toHaveLength(2)
    separators.forEach((node) => expect(node).toHaveClass('text-white'))
  })
})
