import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import EditProfilePage from './index'

const mockBack = vi.fn()
const mockUpdateProfile = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => ({
    data: {
      profile: {
        firstName: 'علی',
        lastName: 'محمدی',
        mobileNumber: '09123456789',
        nationalCode: '0012345678',
        nationalCodeVerificationStatus: { value: 'verified' },
      },
    },
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfile,
    isPending: false,
  }),
  getProfileQueryKey: () => ['profile'],
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('EditProfilePage component', () => {
  beforeEach(() => {
    mockBack.mockReset()
    mockUpdateProfile.mockReset()
  })

  test('renders user profile input fields prefilled with data', () => {
    render(<EditProfilePage />)

    expect(screen.getByDisplayValue('علی')).toBeInTheDocument()
    expect(screen.getByDisplayValue('محمدی')).toBeInTheDocument()
  })

  test('disables submit button when form is not dirty', () => {
    render(<EditProfilePage />)

    const submitBtn = screen.getByRole('button', { name: 'ویرایش اطلاعات' })
    expect(submitBtn).toBeDisabled()
  })

  test('enables submit button and dispatches updateProfile on name edit', async () => {
    const user = userEvent.setup()
    render(<EditProfilePage />)

    const firstNameInput = screen.getByDisplayValue('علی')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'رضا')

    const submitBtn = screen.getByRole('button', { name: 'ویرایش اطلاعات' })
    expect(submitBtn).toBeEnabled()

    await user.click(submitBtn)

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'رضا',
          lastName: 'محمدی',
        }),
      }),
    )
  })
})
