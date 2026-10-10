import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { useSentryUserInit } from './useSentryUserInit'

const mockSetUser = vi.fn()

let mockProfile: { profile: { id: string; mobileNumber: string } } | undefined

vi.mock('@sentry/nextjs', () => ({
  setUser: (...args: unknown[]) => mockSetUser(...args),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({ data: mockProfile }),
}))

describe('useSentryUserInit', () => {
  beforeEach(() => {
    mockSetUser.mockReset()
    mockProfile = { profile: { id: 'U-42', mobileNumber: '+989123456789' } }
  })

  test('sets only the user id when enabled with a profile', () => {
    renderHook(() => useSentryUserInit({ enabled: true }))

    expect(mockSetUser).toHaveBeenCalledTimes(1)
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'U-42' })
  })

  test('does nothing when disabled or profile is missing', () => {
    renderHook(() => useSentryUserInit({ enabled: false }))

    mockProfile = undefined
    renderHook(() => useSentryUserInit({ enabled: true }))

    expect(mockSetUser).not.toHaveBeenCalled()
  })

  test('clears the user on unmount', () => {
    const { unmount } = renderHook(() => useSentryUserInit({ enabled: true }))

    unmount()

    expect(mockSetUser).toHaveBeenLastCalledWith(null)
  })
})
