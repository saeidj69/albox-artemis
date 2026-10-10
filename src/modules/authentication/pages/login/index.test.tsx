import { ROUTES } from '@/constants'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import LoginPage from './index'

const mockReplace = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => mockUseProfile(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockUseProfile.mockReset()
  })

  test('renders the phone number form when the user is not authenticated', () => {
    mockUseProfile.mockReturnValue({ data: undefined })

    render(<LoginPage />)

    expect(screen.getByText('ورود به حساب کاربری')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('redirects to home when the profile request resolves (already logged in)', () => {
    mockUseProfile.mockReturnValue({ data: { profile: {} } })

    render(<LoginPage />)

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME)
  })
})
