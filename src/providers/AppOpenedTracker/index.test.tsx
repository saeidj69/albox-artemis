import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import { AppOpenedTracker } from './index'

const track = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

describe('AppOpenedTracker', () => {
  beforeEach(() => {
    track.mockReset()
  })

  test('tracks app_opened once on mount', () => {
    render(<AppOpenedTracker />)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.APP_OPENED, { plausible: true })
  })
})
