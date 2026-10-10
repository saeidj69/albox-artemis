import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BasketAlert from './index'

const applyProposedChanges = vi.fn()

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketAlerts: () => ({
    applyProposedChanges,
  }),
}))

describe('BasketAlert', () => {
  test('renders static copy and applies proposed changes on click', async () => {
    applyProposedChanges.mockReset()
    const user = userEvent.setup()

    render(<BasketAlert />)

    expect(screen.getByText('تغییر در سبد خرید')).toBeInTheDocument()
    expect(
      screen.getByText('برخی از کالاها در سبد خرید شما شامل تغییراتی شده‌اند.'),
    ).toBeInTheDocument()
    expect(screen.getByText('لطفا تغییرات را بررسی کنید.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'متوجه شدم' }))

    expect(applyProposedChanges).toHaveBeenCalledTimes(1)
  })
})
