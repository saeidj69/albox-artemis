import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCashbackBadgeExpand } from './use-cashback-badge-expand'

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

describe('cashback badge expand handle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubMatchMedia(false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('stays collapsed until expand is called', () => {
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    expect(result.current.collapsed).toBe(true)
    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.collapsed).toBe(true)
  })

  it('waits 500ms, expands for 3 seconds, then stays collapsed', () => {
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    act(() => result.current.handle.expand())
    expect(result.current.collapsed).toBe(true)
    act(() => vi.advanceTimersByTime(499))
    expect(result.current.collapsed).toBe(true)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.collapsed).toBe(false)
    act(() => vi.advanceTimersByTime(2999))
    expect(result.current.collapsed).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.collapsed).toBe(true)
    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.collapsed).toBe(true)
  })

  it('re-arms when expand is called again after collapsing', () => {
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    act(() => result.current.handle.expand())
    act(() => vi.advanceTimersByTime(3500))
    expect(result.current.collapsed).toBe(true)
    act(() => result.current.handle.expand())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.collapsed).toBe(false)
  })

  it('collapses immediately when collapse is called', () => {
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    act(() => result.current.handle.expand())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.collapsed).toBe(false)
    act(() => result.current.handle.collapse())
    expect(result.current.collapsed).toBe(true)
    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.collapsed).toBe(true)
  })

  it('stays expanded for the always-expanded presentation', () => {
    const { result } = renderHook(() => useCashbackBadgeExpand(true))
    expect(result.current.collapsed).toBe(false)
    act(() => result.current.handle.expand())
    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.collapsed).toBe(false)
  })

  it('keeps a stable handle identity across renders', () => {
    const { result, rerender } = renderHook(() => useCashbackBadgeExpand(false))
    const first = result.current.handle
    rerender()
    expect(result.current.handle).toBe(first)
  })

  it('expands without the delay under reduced motion, then collapses on time', () => {
    vi.unstubAllGlobals()
    stubMatchMedia(true)
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    act(() => result.current.handle.expand())
    expect(result.current.collapsed).toBe(false)
    act(() => vi.advanceTimersByTime(2999))
    expect(result.current.collapsed).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.collapsed).toBe(true)
  })

  it('keeps the running preview if reduced motion turns on mid-preview', () => {
    vi.unstubAllGlobals()
    const media = stubMatchMedia(false)
    const { result } = renderHook(() => useCashbackBadgeExpand(false))
    act(() => result.current.handle.expand())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.collapsed).toBe(false)

    act(() => media.setMatches(true))
    expect(result.current.collapsed).toBe(false)
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.collapsed).toBe(true)
  })
})
