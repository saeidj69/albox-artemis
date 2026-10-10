import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { useAnalyticsAuthInit } from './useAnalyticsAuthInit'

const mockIdentifyAnalyticsUser = vi.fn()

let mockProfile:
  | {
      profile: {
        id: string
        mobileNumber: string
        firstName: string
        lastName: string
      }
    }
  | undefined

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({ data: mockProfile }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    identifyAnalyticsUser: (...args: unknown[]) =>
      mockIdentifyAnalyticsUser(...args),
  }
})

describe('useAnalyticsAuthInit', () => {
  beforeEach(() => {
    mockIdentifyAnalyticsUser.mockReset()
    mockProfile = {
      profile: {
        id: 'U-42',
        mobileNumber: '+989123456789',
        firstName: 'عباس',
        lastName: 'مرتضوی',
      },
    }
  })

  test('identifies the profile user when enabled', () => {
    renderHook(() => useAnalyticsAuthInit({ enabled: true }))

    expect(mockIdentifyAnalyticsUser).toHaveBeenCalledWith({
      id: 'U-42',
      mobileNumber: '+989123456789',
      firstName: 'عباس',
      lastName: 'مرتضوی',
    })
  })

  test('does nothing when disabled', () => {
    renderHook(() => useAnalyticsAuthInit({ enabled: false }))

    expect(mockIdentifyAnalyticsUser).not.toHaveBeenCalled()
  })

  test('does nothing when profile is missing', () => {
    mockProfile = undefined

    renderHook(() => useAnalyticsAuthInit({ enabled: true }))

    expect(mockIdentifyAnalyticsUser).not.toHaveBeenCalled()
  })
})
