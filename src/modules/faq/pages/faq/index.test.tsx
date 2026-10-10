import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import FaqPage from './index'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('FaqPage', () => {
  test('renders header title and first category items by default', () => {
    render(<FaqPage />)

    expect(screen.getByText('سوالات پرتکرار')).toBeInTheDocument()

    // Default selected category is 'ارسال و تحویل سفارش'
    expect(
      screen.getByText('زمان ارسال سفارش چگونه تعیین می‌شود؟'),
    ).toBeInTheDocument()
  })

  test('switches questions when clicking a different category chip', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)

    const returnsChip = screen.getByText('مرجوعی سفارش')
    await user.click(returnsChip)

    // Should render questions from the returns category
    expect(
      screen.getByText(
        'چگونه می‌توانیم یک کالا را مرجوع کنیم و شرایط مرجوعی چیست؟',
      ),
    ).toBeInTheDocument()
  })
})
