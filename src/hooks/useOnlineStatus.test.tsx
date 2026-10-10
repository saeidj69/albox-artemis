import { act } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import useOnlineStatus from './useOnlineStatus'

const mockRefresh = vi.fn()
const mockToastLoading = vi.fn()
const mockToastSuccess = vi.fn()
const mockServiceWorkerRegister = vi.fn().mockResolvedValue(undefined)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('lodash', () => ({
  debounce: (fn: (...args: unknown[]) => void) => fn,
}))

vi.mock('sonner', () => ({
  toast: {
    loading: (...args: unknown[]) => mockToastLoading(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

const setOnline = (isOnline: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  })

  act(() => {
    window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'))
  })
}

describe('useOnlineStatus hook', () => {
  beforeEach(() => {
    mockRefresh.mockReset()
    mockToastLoading.mockReset().mockReturnValue('toast-id')
    mockToastSuccess.mockReset()
    mockServiceWorkerRegister.mockClear()

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: mockServiceWorkerRegister },
    })
  })

  test('registers the service worker on mount', () => {
    renderHook(() => useOnlineStatus())

    expect(mockServiceWorkerRegister).toHaveBeenCalledWith('/sw.js')
  })

  test('does not throw when service worker registration fails', async () => {
    mockServiceWorkerRegister.mockRejectedValueOnce(new Error('unsupported'))

    expect(() => renderHook(() => useOnlineStatus())).not.toThrow()
  })

  test('shows a non-dismissible loading toast when connection drops', () => {
    renderHook(() => useOnlineStatus())

    setOnline(false)

    expect(mockToastLoading).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ dismissible: false }),
    )
    expect(mockToastSuccess).not.toHaveBeenCalled()
  })

  test('refreshes and replaces the loading toast with a success toast when back online', () => {
    renderHook(() => useOnlineStatus())

    setOnline(false)
    setOnline(true)

    expect(mockRefresh).toHaveBeenCalledTimes(1)
    expect(mockToastSuccess).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ id: 'toast-id' }),
    )
  })

  test('does not refresh or toast success if it was never offline', () => {
    renderHook(() => useOnlineStatus())

    setOnline(true)

    expect(mockRefresh).not.toHaveBeenCalled()
    expect(mockToastSuccess).not.toHaveBeenCalled()
  })
})
