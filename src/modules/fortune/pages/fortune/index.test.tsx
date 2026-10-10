import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { ClientRewardRarity } from '@/api/models/tyche'

import FortunePage from './index'

const mockPlayGameMutate = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

vi.mock('@/api/functions/tyche/client', () => ({
  useGetClientBalance: () => ({
    data: { balance: 2 },
    isLoading: false,
  }),
  useGetClientGame: (gameId: number) => ({
    data: {
      game: {
        id: gameId,
        shortDescription: 'گردونه شانس',
        attributes: {
          slots: [
            {
              id: 1,
              position: 1,
              rarity: ClientRewardRarity.common,
              rewardId: 101,
            },
            {
              id: 2,
              position: 2,
              rarity: ClientRewardRarity.legendary,
              rewardId: 102,
            },
          ],
        },
      },
    },
    isLoading: false,
  }),
  useListClientPlays: () => ({
    data: { plays: [] },
    isLoading: false,
  }),
  usePlayClientGame: () => ({
    mutateAsync: mockPlayGameMutate,
  }),
  getGetClientBalanceQueryKey: () => ['client-balance'],
  getListClientPlaysQueryKey: () => ['client-plays'],
}))

vi.mock('@/api/functions/wallet-management', () => ({
  getGetPaymentProfileQueryKey: () => ['payment-profile'],
}))

vi.mock('../../components/wheel', () => ({
  default: ({ onSpinEnded }: { onSpinEnded: (index: number) => void }) => (
    <div data-testid="wheel-component">
      <button onClick={() => onSpinEnded(0)}>Simulate End Spin</button>
    </div>
  ),
}))

vi.mock('../../components/plays-history', () => ({
  default: () => <div data-testid="plays-history">Plays History</div>,
}))

describe('FortunePage', () => {
  beforeEach(() => {
    mockPlayGameMutate.mockReset()
  })

  test('renders ticket balance chip and spin button when tickets > 0', () => {
    render(<FortunePage gameId={1} />)

    expect(screen.getByText('گردونه شانس')).toBeInTheDocument()
    expect(screen.getByText('۲ بلیط فعال')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'بچرخون!' })).toBeEnabled()
  })

  test('triggers spin when spin button is clicked', async () => {
    mockPlayGameMutate.mockResolvedValue({
      play: {
        reward: { id: 101 },
      },
    })

    const user = userEvent.setup()
    render(<FortunePage gameId={1} />)

    const spinBtn = screen.getByRole('button', { name: 'بچرخون!' })
    await user.click(spinBtn)

    expect(mockPlayGameMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        game: 1,
      }),
    )
  })
})
