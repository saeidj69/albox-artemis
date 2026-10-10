import { act, renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { useVideoFullscreen } from './use-video-fullscreen'

describe('useVideoFullscreen', () => {
  test('enterFullscreen calls requestFullscreen on playerRef current object', () => {
    const { result } = renderHook(() => useVideoFullscreen())

    const mockRequestFullscreen = vi.fn()
    result.current.playerRef.current = {
      requestFullscreen: mockRequestFullscreen,
    }

    act(() => {
      result.current.enterFullscreen()
    })

    expect(mockRequestFullscreen).toHaveBeenCalledOnce()
  })

  test('enterFullscreen does not throw if playerRef current is null', () => {
    const { result } = renderHook(() => useVideoFullscreen())

    expect(() => {
      act(() => {
        result.current.enterFullscreen()
      })
    }).not.toThrow()
  })
})
