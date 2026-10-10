import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import ProtectedError from './index'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

describe('ProtectedError component', () => {
  const originalReload = window.location.reload

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: vi.fn() },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: originalReload },
    })
  })

  test('renders error message and both action buttons', () => {
    render(<ProtectedError onLogout={vi.fn()} />)

    expect(screen.getByText('خطا در دریافت حساب کاربری')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /تلاش مجدد/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /خروج از حساب/ }),
    ).toBeInTheDocument()
  })

  test('reloads the page when retry button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProtectedError onLogout={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /تلاش مجدد/ }))

    expect(window.location.reload).toHaveBeenCalled()
  })

  test('calls onLogout when logout button is clicked', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(<ProtectedError onLogout={onLogout} />)

    await user.click(screen.getByRole('button', { name: /خروج از حساب/ }))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  test('shows loading state on logout button when isLoggingOut is true', () => {
    render(<ProtectedError onLogout={vi.fn()} isLoggingOut />)

    expect(
      screen.getByRole('button', { name: /خروج از حساب/ }),
    ).toHaveAttribute('data-loading', 'true')
  })
})
