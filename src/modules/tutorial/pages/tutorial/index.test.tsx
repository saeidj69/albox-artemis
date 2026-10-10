import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import TutorialPage from './index'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

const mockEnterFullscreen = vi.fn()
vi.mock('@/modules/tutorial/hooks/use-video-fullscreen', () => ({
  useVideoFullscreen: () => ({
    playerRef: { current: null },
    enterFullscreen: mockEnterFullscreen,
  }),
}))

vi.mock('./components/tutorialVideoPlayer', () => ({
  default: () => <div data-testid="tutorial-video-player">Video Player</div>,
}))

describe('TutorialPage', () => {
  test('renders header and video player component', () => {
    render(<TutorialPage />)

    expect(screen.getByText('راهنمای ثبت سفارش')).toBeInTheDocument()
    expect(screen.getByTestId('tutorial-video-player')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'مشاهده تمام صفحه' }),
    ).toBeInTheDocument()
  })

  test('clicking fullscreen button triggers enterFullscreen', async () => {
    const user = userEvent.setup()
    render(<TutorialPage />)

    const btn = screen.getByRole('button', { name: 'مشاهده تمام صفحه' })
    await user.click(btn)

    expect(mockEnterFullscreen).toHaveBeenCalledOnce()
  })
})
