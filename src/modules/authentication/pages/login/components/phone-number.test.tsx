import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import PhoneNumberForm from './phone-number'

const mockGenerateOtp = vi.fn()
const mockIsGeneratingOtp = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('@/api/functions/auth', () => ({
  useGenerateOtp: () => ({
    mutate: mockGenerateOtp,
    isPending: mockIsGeneratingOtp(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

describe('PhoneNumberForm', () => {
  beforeEach(() => {
    mockGenerateOtp.mockReset()
    mockIsGeneratingOtp.mockReturnValue(false)
    mockToastSuccess.mockReset()
  })

  test('renders phone number input and disabled submit button initially', () => {
    render(<PhoneNumberForm />)

    expect(screen.getByText('ورود به حساب کاربری')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('09123456789')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: 'ارسال کد ورود' })
    expect(submitBtn).toBeDisabled()
  })

  test('enables submit button when 11 valid mobile digits are entered', async () => {
    const user = userEvent.setup()
    render(<PhoneNumberForm />)

    const input = screen.getByPlaceholderText('09123456789')
    await user.type(input, '09123456789')

    const submitBtn = screen.getByRole('button', { name: 'ارسال کد ورود' })
    expect(submitBtn).toBeEnabled()
  })

  test('converts Persian digits and calls generateOtp on form submit', async () => {
    const user = userEvent.setup()
    render(<PhoneNumberForm />)

    const input = screen.getByPlaceholderText('09123456789')
    await user.type(input, '۰۹۱۲۳۴۵۶۷۸۹')

    const submitBtn = screen.getByRole('button', { name: 'ارسال کد ورود' })
    await user.click(submitBtn)

    expect(mockGenerateOtp).toHaveBeenCalledWith(
      { data: { mobileNumber: '09123456789', scope: 'client' } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })
})
