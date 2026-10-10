import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { useNationalCodeVerification } from './useNationalCodeVerification'

const mockUseProfile = vi.fn()

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => mockUseProfile(),
}))

describe('useNationalCodeVerification', () => {
  beforeEach(() => {
    mockUseProfile.mockReset()
  })

  test('returns verified status when nationalCodeVerificationStatus is verified', () => {
    mockUseProfile.mockReturnValue({
      data: {
        profile: {
          nationalCodeVerificationStatus: {
            value: 'verified',
            label: 'تایید شده',
          },
        },
      },
    })

    const { result } = renderHook(() => useNationalCodeVerification())

    expect(result.current.verificationStatus).toBe('verified')
  })

  test('returns undefined when profile is not loaded or missing status', () => {
    mockUseProfile.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useNationalCodeVerification())

    expect(result.current.verificationStatus).toBeUndefined()
  })
})
