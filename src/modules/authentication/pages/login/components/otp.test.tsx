import { ROUTES } from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { UserDeviceFingerprint } from '@/api/models'

import OtpForm from './otp'

const mockGenerateOtp = vi.fn()
const mockVerifyOtp = vi.fn()
const mockIsGeneratingOtp = vi.fn()
const mockIsVerifyingOtp = vi.fn()
const mockReplace = vi.fn()
const mockUseFingerprint = vi.fn()
const track = vi.fn()
const mockRemoveQueries = vi.fn()
const mockSetRegistrationPending = vi.fn()

const fingerprintFixture: UserDeviceFingerprint = {
  id: 'tm-otp-fingerprint',
  platform: 'Android',
  osName: 'Android',
  osVersion: '14',
  browserName: 'Chrome',
  browserVersion: '126.0.0.0',
  timezone: 'Asia/Tehran',
  locale: 'fa-IR',
  screenResolution: '412x915',
  viewportSize: '412x892',
  deviceMemory: 4,
  hardwareConcurrency: 8,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

vi.mock('@/api/functions/auth', () => ({
  useGenerateOtp: () => ({
    mutate: mockGenerateOtp,
    isPending: mockIsGeneratingOtp(),
  }),
  useVerifyOtp: () => ({
    mutate: mockVerifyOtp,
    isPending: mockIsVerifyingOtp(),
  }),
}))

vi.mock('@/api/functions/profile', () => ({
  getProfileQueryKey: () => ['profile'],
}))

vi.mock('@/hooks/useFingerprint', () => ({
  default: () => mockUseFingerprint(),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/providers/ReactQuery', () => ({
  queryClient: {
    removeQueries: (...args: unknown[]) => mockRemoveQueries(...args),
  },
}))

vi.mock('@/modules/authentication/utils/registration-storage', () => ({
  setRegistrationPending: (...args: unknown[]) =>
    mockSetRegistrationPending(...args),
}))

vi.mock('@/modules/authentication/utils/expire', () => ({
  calculateRemainingSeconds: () => 120,
}))

vi.mock('@/modules/authentication/hooks/use-read-otp-from-sms', () => ({
  useReadOtpFromSms: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('OtpForm', () => {
  beforeEach(() => {
    mockGenerateOtp.mockReset()
    mockVerifyOtp.mockReset()
    mockIsGeneratingOtp.mockReturnValue(false)
    mockIsVerifyingOtp.mockReturnValue(false)
    mockReplace.mockReset()
    mockUseFingerprint.mockReturnValue({ fingerprint: null })
    track.mockReset()
    mockRemoveQueries.mockReset()
    mockSetRegistrationPending.mockReset()
  })

  test('renders OTP input and timer countdown state', () => {
    render(<OtpForm />)

    expect(
      screen.getByText('کد ارسال شده به شماره بالا را وارد کنید'),
    ).toBeInTheDocument()
  })

  test('calls verifyOtp when 5 digits are entered in OTP field', async () => {
    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    expect(mockVerifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ otp: '12345' }),
      }),
      expect.any(Object),
    )
  })

  test('includes fingerprint in verifyOtp payload when available', async () => {
    mockUseFingerprint.mockReturnValue({ fingerprint: fingerprintFixture })

    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    expect(mockVerifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          otp: '12345',
          fingerprint: fingerprintFixture,
        }),
      }),
      expect.any(Object),
    )
  })

  test('omits fingerprint from verifyOtp payload when still null', async () => {
    mockUseFingerprint.mockReturnValue({ fingerprint: null })

    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    expect(mockVerifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          otp: '12345',
          fingerprint: undefined,
        }),
      }),
      expect.any(Object),
    )
  })

  test('tracks login via GTM after a successful OTP verification', async () => {
    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    const onSuccess = mockVerifyOtp.mock.calls[0][1].onSuccess as (result: {
      state: 'valid'
      profile: { id: string }
    }) => void

    onSuccess({
      state: 'valid',
      profile: { id: 'user-42' },
    })

    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['profile'],
    })
    expect(track).toHaveBeenCalledWith(EVENTS.LOGIN, {
      gtm: {
        method: 'otp',
        user_id: 'user-42',
        user_type: 'buyer',
      },
    })
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME)
  })

  test('does not track login when OTP verification does not succeed', async () => {
    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    expect(mockVerifyOtp).toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('does not track login when OTP verification requires registration', async () => {
    const user = userEvent.setup()
    const { container } = render(<OtpForm />)

    const inputs = container.querySelectorAll('input')
    if (inputs.length > 0) {
      await user.type(inputs[0], '12345')
    }

    const onSuccess = mockVerifyOtp.mock.calls[0][1].onSuccess as (result: {
      state: 'pending_registration'
      metadata: { registrationTtl: number }
    }) => void

    onSuccess({
      state: 'pending_registration',
      metadata: { registrationTtl: 600 },
    })

    expect(track).not.toHaveBeenCalled()
    expect(mockSetRegistrationPending).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTH.REGISTER)
  })
})
