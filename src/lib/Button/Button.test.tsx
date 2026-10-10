import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import Button from './Button'

describe('Button component', () => {
  test('renders children text and handles click event', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>کلیک کنید</Button>)

    const button = screen.getByRole('button', { name: 'کلیک کنید' })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disables button and displays loading spinner when loading is true', () => {
    const { container } = render(<Button loading>در حال ارسال</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-loading', 'true')
    expect(
      container.querySelector('[data-slot="button-spinner"]'),
    ).toBeInTheDocument()
  })

  test('renders startIcon and endIcon slots correctly', () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon">★</span>}
        endIcon={<span data-testid="end-icon">→</span>}
      >
        آیکون‌دار
      </Button>,
    )

    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })
})
