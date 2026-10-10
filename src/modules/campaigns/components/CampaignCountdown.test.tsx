import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { act, render, screen } from '@/utils/test-utils'

import CampaignCountdown from './CampaignCountdown'

const NOW = new Date('2026-09-27T12:00:00Z').getTime()
const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const endAtIn = (ms: number) => new Date(NOW + ms).toISOString()

describe('CampaignCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('shows days, hours and minutes when at least a day is left', () => {
    render(<CampaignCountdown endAt={endAtIn(DAY_MS)} />)

    expect(screen.getByText('روز')).toBeInTheDocument()
    expect(screen.getByText('ساعت')).toBeInTheDocument()
    expect(screen.getByText('دقیقه')).toBeInTheDocument()
    expect(screen.queryByText('ثانیه')).not.toBeInTheDocument()
  })

  test('switches to hours, minutes and seconds once days reach 0', () => {
    render(<CampaignCountdown endAt={endAtIn(23 * HOUR_MS)} />)

    expect(screen.getByText('ساعت')).toBeInTheDocument()
    expect(screen.getByText('دقیقه')).toBeInTheDocument()
    expect(screen.getByText('ثانیه')).toBeInTheDocument()
    expect(screen.queryByText('روز')).not.toBeInTheDocument()
  })

  test('switches format live when days drop to 0', () => {
    render(<CampaignCountdown endAt={endAtIn(DAY_MS + 2000)} />)

    expect(screen.getByText('روز')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText('ثانیه')).toBeInTheDocument()
    expect(screen.queryByText('روز')).not.toBeInTheDocument()
  })

  test('renders nothing when endAt has already passed', () => {
    const { container } = render(
      <CampaignCountdown endAt={endAtIn(-MINUTE_MS)} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  test('hides itself once endAt passes while mounted', () => {
    const { container } = render(<CampaignCountdown endAt={endAtIn(2000)} />)

    expect(screen.getByText('ثانیه')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(container).toBeEmptyDOMElement()
  })
})
