import { createRef } from 'react'

import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CashbackBadge from './CashbackBadge'
import type { CashbackBadgeHandle } from './types'

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>()
  let matches = initialMatches

  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      get matches() {
        return matches
      },
      media,
      addEventListener: (
        _event: string,
        listener: (e: { matches: boolean }) => void,
      ) => {
        listeners.add(listener)
      },
      removeEventListener: (
        _event: string,
        listener: (e: { matches: boolean }) => void,
      ) => {
        listeners.delete(listener)
      },
    })),
  )

  return {
    setMatches: (next: boolean) => {
      matches = next
      for (const listener of listeners) listener({ matches: next })
    },
  }
}

describe('CashbackBadge presentation', () => {
  beforeEach(() => {
    stubMatchMedia(false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('stays expanded for the single-product presentation', () => {
    vi.useFakeTimers()
    const { container } = render(<CashbackBadge percent={2} alwaysExpanded />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')
    const label = container.querySelector('[data-slot="cashback-badge-label"]')
    expect(badge).not.toHaveAttribute('data-collapsed')
    expect(label).toHaveTextContent('بازگشت اعتبار')
    act(() => vi.advanceTimersByTime(10000))
    expect(badge).not.toHaveAttribute('data-collapsed')
    expect(label).toHaveTextContent('بازگشت اعتبار')
  })

  it('names the benefit on the root in both states', () => {
    const { container, rerender } = render(<CashbackBadge percent={2} />)
    for (const expanded of [false, true]) {
      rerender(<CashbackBadge percent={2} alwaysExpanded={expanded} />)
      expect(
        container.querySelector('[data-slot="cashback-badge"]'),
      ).toHaveAttribute('aria-label', '٪۲ بازگشت اعتبار')
    }
  })

  it('renders a caller-provided label', () => {
    const { container } = render(
      <CashbackBadge percent={2} alwaysExpanded label="بازگشت وجه" />,
    )
    expect(
      container.querySelector('[data-slot="cashback-badge-label"]'),
    ).toHaveTextContent('بازگشت وجه')
    expect(
      container.querySelector('[data-slot="cashback-badge"]'),
    ).toHaveAttribute('aria-label', '٪۲ بازگشت وجه')
  })

  it('renders the pill shape for inline rows', () => {
    const { container } = render(
      <CashbackBadge percent={2} alwaysExpanded shape="pill" />,
    )
    expect(container.querySelector('[data-slot="cashback-badge"]')).toHaveClass(
      'rounded-full',
      'typo-label-small',
    )
  })

  it('uses the exact SVG background, text and wallet colors in both states', () => {
    const { container, rerender } = render(<CashbackBadge percent={2} />)
    for (const expanded of [false, true]) {
      rerender(<CashbackBadge percent={2} alwaysExpanded={expanded} />)
      expect(
        container.querySelector('[data-slot="cashback-badge"]'),
      ).toHaveClass('bg-primary-100', 'text-primary-600')
      expect(
        container.querySelector('[data-slot="cashback-badge-icon"]'),
      ).toHaveClass('text-primary-600')
    }
  })

  it('expands 500ms after the ref handle is called, then collapses', () => {
    vi.useFakeTimers()
    const ref = createRef<CashbackBadgeHandle>()
    const { container } = render(<CashbackBadge percent={2} ref={ref} />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')

    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => ref.current?.expand())
    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => vi.advanceTimersByTime(499))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
    act(() => vi.advanceTimersByTime(1))
    expect(badge).not.toHaveAttribute('data-collapsed')
    act(() => vi.advanceTimersByTime(2999))
    expect(badge).not.toHaveAttribute('data-collapsed')
    act(() => vi.advanceTimersByTime(1))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
  })

  it('re-arms on a second expand call and collapses on demand', () => {
    vi.useFakeTimers()
    const ref = createRef<CashbackBadgeHandle>()
    const { container } = render(<CashbackBadge percent={2} ref={ref} />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')

    act(() => ref.current?.expand())
    act(() => vi.advanceTimersByTime(3500))
    expect(badge).toHaveAttribute('data-collapsed', 'true')

    act(() => ref.current?.expand())
    act(() => vi.advanceTimersByTime(500))
    expect(badge).not.toHaveAttribute('data-collapsed')

    act(() => ref.current?.collapse())
    expect(badge).toHaveAttribute('data-collapsed', 'true')
  })

  it('shows the label immediately when reduced motion is preferred', () => {
    vi.useFakeTimers()
    vi.unstubAllGlobals()
    stubMatchMedia(true)
    const ref = createRef<CashbackBadgeHandle>()
    const { container } = render(<CashbackBadge percent={2} ref={ref} />)
    const badge = container.querySelector('[data-slot="cashback-badge"]')

    act(() => ref.current?.expand())
    expect(badge).not.toHaveAttribute('data-collapsed')
    act(() => vi.advanceTimersByTime(3000))
    expect(badge).toHaveAttribute('data-collapsed', 'true')
  })
})
