import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { VerificationStatus } from '@/api/models'

import NationalCodeVerificationWarning from './index'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('NationalCodeVerificationWarning component', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  test('returns null when verificationStatus is verified or undefined', () => {
    const { container: container1 } = render(
      <NationalCodeVerificationWarning
        verificationStatus={VerificationStatus.verified}
      />,
    )
    expect(container1).toBeEmptyDOMElement()

    const { container: container2 } = render(
      <NationalCodeVerificationWarning verificationStatus={undefined} />,
    )
    expect(container2).toBeEmptyDOMElement()
  })

  test('renders warning alert when status is pending', () => {
    render(
      <NationalCodeVerificationWarning
        verificationStatus={VerificationStatus.pending}
      />,
    )

    expect(
      screen.getByText('در حال بررسی تطابق کد ملی و شماره موبایل'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('تا دقایقی دیگر نتیجه بررسی مشخص می‌شود.'),
    ).toBeInTheDocument()
  })

  test('renders error alert and action button navigating to edit page when status is rejected', async () => {
    const user = userEvent.setup()
    render(
      <NationalCodeVerificationWarning
        verificationStatus={VerificationStatus.rejected}
        hasAction
      />,
    )

    expect(
      screen.getByText('عدم تطابق کد ملی و شماره موبایل'),
    ).toBeInTheDocument()

    const editBtn = screen.getByRole('button', { name: 'اصلاح اطلاعات' })
    await user.click(editBtn)

    expect(mockPush).toHaveBeenCalledWith('/profile/edit')
  })
})
