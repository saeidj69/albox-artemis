import { ROUTES } from '@/constants'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { useLogout } from './useLogout'

const mockPush = vi.fn()
const mockMutate = vi.fn()
const mockClearAnalyticsUser = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/api/functions/auth', () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    clearAnalyticsUser: () => mockClearAnalyticsUser(),
  }
})

describe('useLogout hook', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockMutate.mockReset()
    mockClearAnalyticsUser.mockReset()
    localStorage.clear()
  })

  test('clears query cache, storage, and redirects to login on success', () => {
    const { result } = renderHook(() => useLogout())

    localStorage.setItem('token', 'abc')

    result.current.logout()

    expect(mockMutate).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )

    const onSuccess = mockMutate.mock.calls[0][1].onSuccess
    onSuccess()

    expect(mockClearAnalyticsUser).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
  })

  test('invokes custom onSuccess callback after cleanup', () => {
    const customOnSuccess = vi.fn()
    const { result } = renderHook(() =>
      useLogout({ onSuccess: customOnSuccess }),
    )

    result.current.logout()

    const onSuccess = mockMutate.mock.calls[0][1].onSuccess
    onSuccess()

    expect(mockClearAnalyticsUser).toHaveBeenCalledTimes(1)
    expect(customOnSuccess).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
  })
})
