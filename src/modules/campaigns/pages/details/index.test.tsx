import { EVENTS } from '@/helpers/analytics'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render } from '@/utils/test-utils'

import CampaignDetailsPage from './index'

const track = vi.fn()

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/modules/discovery/pages/prepared', () => ({
  default: () => null,
}))

describe('CampaignDetailsPage tracking', () => {
  beforeEach(() => {
    track.mockReset()
  })

  test('tracks view_campaign for /campaign/1 with campaign_name 1', () => {
    render(<CampaignDetailsPage campaignId={1} />)

    expect(track).toHaveBeenCalledWith(EVENTS.VIEW_CAMPAIGN, {
      webengage: { campaign_name: 1 },
    })
  })

  test('does not track view_campaign when the campaign id is not a number', () => {
    render(<CampaignDetailsPage campaignId={Number.NaN} />)

    expect(track).not.toHaveBeenCalled()
  })
})
