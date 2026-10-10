import { ROUTES } from '@/constants'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import ProtectedLayout from './layout'

const mockRedirect = vi.fn()
const mockPush = vi.fn()
const mockUseProfile = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => mockUseProfile(),
}))

vi.mock('@/api/functions/auth', () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketSync: vi.fn(),
}))

describe('ProtectedLayout', () => {
  beforeEach(() => {
    mockRedirect.mockReset()
    mockPush.mockReset()
    mockUseProfile.mockReset()
  })

  test('redirects to login when profile request fails with 401', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isError: true,
      error: { isAxiosError: true, response: { status: 401 } },
    })

    render(<ProtectedLayout>content</ProtectedLayout>)

    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
  })

  test('renders error page instead of redirecting when error is not 401', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isError: true,
      error: { isAxiosError: true, response: { status: 500 } },
    })

    render(<ProtectedLayout>content</ProtectedLayout>)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(screen.getByText('خطا در دریافت حساب کاربری')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /خروج از حساب/ }),
    ).toBeInTheDocument()
  })

  test('does not render the error page while profile request has no error', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isError: false,
      error: null,
    })

    render(<ProtectedLayout>content</ProtectedLayout>)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(
      screen.queryByText('خطا در دریافت حساب کاربری'),
    ).not.toBeInTheDocument()
  })
})
