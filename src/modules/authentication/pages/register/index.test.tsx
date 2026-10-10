import { ROUTES } from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen, waitFor } from '@/utils/test-utils'

import RegisterPage from './index'

const mockReplace = vi.fn()
const mockRegister = vi.fn()
const mockGetRegistrationPending = vi.fn()
const mockClearRegistrationPending = vi.fn()
const mockRemoveQueries = vi.fn()
const track = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/api/functions/auth', () => ({
  useRegister: () => ({
    mutate: mockRegister,
    isPending: false,
  }),
}))

vi.mock('@/api/functions/profile', () => ({
  getProfileQueryKey: () => ['profile'],
}))

vi.mock('@/providers/ReactQuery', () => ({
  queryClient: {
    removeQueries: (...args: unknown[]) => mockRemoveQueries(...args),
  },
}))

vi.mock('@/modules/authentication/utils/registration-storage', () => ({
  getRegistrationPending: () => mockGetRegistrationPending(),
  clearRegistrationPending: () => mockClearRegistrationPending(),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
}

async function fillValidRegistrationForm() {
  const user = userEvent.setup()

  await user.type(screen.getByPlaceholderText('نام'), 'علی')
  await user.type(screen.getByPlaceholderText('نام خانوادگی'), 'محمدی')
  await user.type(screen.getByPlaceholderText('کد ملی'), '0123456789')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: 'ورود به آل‌باکس' }))

  return user
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockRegister.mockReset()
    mockGetRegistrationPending.mockReset()
    mockClearRegistrationPending.mockReset()
    mockRemoveQueries.mockReset()
    track.mockReset()
  })

  test('redirects to login when registration is not pending', () => {
    mockGetRegistrationPending.mockReturnValue(null)

    render(<RegisterPage />)

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
    expect(
      screen.queryByRole('button', { name: 'ورود به آل‌باکس' }),
    ).not.toBeInTheDocument()
  })

  test('tracks sign_up via track after a successful registration', async () => {
    mockGetRegistrationPending.mockReturnValue({ expiry: Date.now() + 60_000 })

    render(<RegisterPage />)

    await fillValidRegistrationForm()

    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'علی',
          lastName: 'محمدی',
          nationalCode: '0123456789',
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )

    const onSuccess = mockRegister.mock.calls[0][1].onSuccess as (result: {
      profile: { id: string; mobileNumber: string }
    }) => void
    onSuccess({
      profile: { id: 'user-42', mobileNumber: '+989123456789' },
    })

    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['profile'],
    })
    expect(mockClearRegistrationPending).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.REGISTER, {
      gtm: {
        method: 'otp',
        user_id: 'user-42',
        user_type: 'buyer',
      },
      webengage: {
        mode: 'otp',
      },
    })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(ROUTES.SELECT_LOCATION),
      )
    })
  })

  test('does not track sign_up when registration does not succeed', async () => {
    mockGetRegistrationPending.mockReturnValue({ expiry: Date.now() + 60_000 })

    render(<RegisterPage />)

    await fillValidRegistrationForm()

    expect(mockRegister).toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
    expect(mockClearRegistrationPending).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
