import { Suspense } from 'react'

import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { act, render } from '@/utils/test-utils'

import GamePage from './page'

const track = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/api/functions/tyche/client', () => ({
  useGetClientGame: () => ({ data: undefined }),
}))

vi.mock('@/modules/fortune/pages/fortune', () => ({ default: () => null }))
vi.mock('@/components/Header', () => ({ default: () => null }))
vi.mock('@/components/Header/components/HeaderBackButton', () => ({
  default: () => null,
}))
vi.mock('@/components/Layout', () => ({
  default: { Header: () => null },
}))
vi.mock('@/lib/Skeleton', () => ({ default: () => null }))

async function renderGamePage(gameId: string) {
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <GamePage params={Promise.resolve({ gameId })} />
      </Suspense>,
    )
  })
}

describe('GamePage tracking', () => {
  beforeEach(() => {
    track.mockReset()
  })

  test('tracks view_games with the numeric game id as game_name', async () => {
    await renderGamePage('6')

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_GAMES, {
      webengage: { game_name: 6 },
    })
  })

  test('does not track view_games when the game id is not a number', async () => {
    await renderGamePage('not-a-number')

    expect(track).not.toHaveBeenCalled()
  })
})
