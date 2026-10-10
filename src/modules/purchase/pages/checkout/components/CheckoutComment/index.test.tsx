import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import CheckoutComment from './index'

const setComment = vi.fn()
let mockComment = ''

vi.mock('@/modules/purchase/hooks', () => ({
  useCheckoutComment: () => ({
    comment: mockComment,
    setComment,
  }),
}))

describe('CheckoutComment', () => {
  beforeEach(() => {
    setComment.mockReset()
    mockComment = ''
  })

  test('renders section heading and textarea with placeholder', () => {
    render(<CheckoutComment />)
    expect(screen.getByText('توضیحات:')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('توضیح درمورد ارسال سفارش'),
    ).toBeInTheDocument()
  })

  test('calls setComment when user types in textarea', async () => {
    const user = userEvent.setup()
    render(<CheckoutComment />)

    const textarea = screen.getByPlaceholderText('توضیح درمورد ارسال سفارش')
    await user.type(textarea, 'Please call before delivery')

    expect(setComment).toHaveBeenCalled()
  })
})
