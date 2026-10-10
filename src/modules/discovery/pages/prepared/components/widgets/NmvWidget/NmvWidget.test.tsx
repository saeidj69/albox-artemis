import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'
import { IncentivesCampaignState, IncentivesRewardType } from '@/api/models'

import NmvWidget from './index'

type HookState = {
  data: { campaigns: ListMyIncentiveCampaigns200CampaignsItem[] } | undefined
  isPending: boolean
}

const hookState: HookState = {
  data: undefined,
  isPending: false,
}

vi.mock('@/api/functions/incentives', () => ({
  useListMyIncentiveCampaigns: () => hookState,
}))

vi.mock('@/modules/campaigns/components/CampaignCountdown', () => ({
  default: () => <div data-testid="nmv-countdown" />,
}))

vi.mock('./components/NmvTrack', () => ({
  default: () => <div data-testid="nmv-track" />,
}))

const evaluatedStep = (overrides: {
  id?: number
  campaignStepId?: number
  position?: number
  certainProgress?: number
  target?: number
  percentage?: number
}) => ({
  id: overrides.id ?? 1,
  campaignStepId: overrides.campaignStepId ?? 10,
  position: overrides.position ?? 1,
  title: 'Step',
  certainProgress: overrides.certainProgress ?? 0,
  possibleProgress: 0,
  target: overrides.target ?? 200_000_000,
  achieved: false,
  effectiveAchieved: false,
  progressionLocked: false,
  details: {},
  rewardResolved: false,
  estimatedReward: {
    type: IncentivesRewardType.gift_percentage_over_finalized_orders_net_total,
    payload: { percentage: overrides.percentage ?? 0.01 },
  },
})

const campaign = (
  overrides: Partial<ListMyIncentiveCampaigns200CampaignsItem> & {
    state?: IncentivesCampaignState
    evaluationSteps?: ReturnType<typeof evaluatedStep>[]
  } = {},
): ListMyIncentiveCampaigns200CampaignsItem => {
  const {
    evaluationSteps = [evaluatedStep({})],
    state = IncentivesCampaignState.active,
    ...rest
  } = overrides

  return {
    id: 42,
    internalName: 'nmv-sep',
    displayName: 'خرید آخر آخر شهریور',
    description: null,
    startAt: '2026-09-01T00:00:00+03:30',
    endAt: '2026-09-30T23:59:59+03:30',
    progression: 'sequential',
    rewardResolution: 'highest_achieved',
    rewardTiming: 'on_settlement',
    state,
    confirmedAt: null,
    confirmedBy: null,
    settlementStartedAt: null,
    settlementStartedBy: null,
    completedAt: null,
    createdAt: '2026-09-01T00:00:00+03:30',
    updatedAt: '2026-09-01T00:00:00+03:30',
    participantId: 1,
    participant: {
      id: 1,
      campaignId: 42,
      customerId: 1,
      customer: null,
      createdAt: '2026-09-01T00:00:00+03:30',
      updatedAt: '2026-09-01T00:00:00+03:30',
      steps: [],
      evaluation: {
        isFinal: false,
        steps: evaluationSteps,
        resolvedStepIds: [],
        estimatedRewards: [],
      },
    },
    ...rest,
  } as ListMyIncentiveCampaigns200CampaignsItem
}

const NOW = '2026-09-15T12:00:00+03:30'

const endedCampaign = (overrides: {
  id: number
  displayName: string
  completedAt: string | null
}) =>
  campaign({
    ...overrides,
    startAt: '2026-08-01T00:00:00+03:30',
    endAt: '2026-09-10T23:59:59+03:30',
    state: overrides.completedAt
      ? IncentivesCampaignState.completed
      : IncentivesCampaignState.settling,
  })

describe('NmvWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW))
    hookState.data = undefined
    hookState.isPending = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('renders the live campaign card and links to campaign detail', () => {
    hookState.data = { campaigns: [campaign()] }

    render(<NmvWidget />)

    expect(screen.getByText('خرید آخر آخر شهریور')).toBeInTheDocument()
    expect(
      screen.getByText('مسیر دستیابی به جوایز اینجاست'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('nmv-track')).toBeInTheDocument()
    expect(screen.getByTestId('nmv-countdown')).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/campaigns/42')
  })

  test('renders nothing while the query is pending', () => {
    hookState.isPending = true

    const { container } = render(<NmvWidget />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(
      screen.queryByText('مسیر دستیابی به جوایز اینجاست'),
    ).not.toBeInTheDocument()
  })

  test('renders nothing when the only campaign completed over 3 days ago', () => {
    hookState.data = {
      campaigns: [
        endedCampaign({
          id: 1,
          displayName: 'قدیمی',
          completedAt: '2026-09-11T12:00:00+03:30',
        }),
      ],
    }

    const { container } = render(<NmvWidget />)

    expect(container).toBeEmptyDOMElement()
  })

  test('renders nothing when the live campaign has no track steps', () => {
    hookState.data = {
      campaigns: [campaign({ evaluationSteps: [] })],
    }

    const { container } = render(<NmvWidget />)

    expect(container).toBeEmptyDOMElement()
  })

  test('renders a campaign that ended and completed 1 day ago', () => {
    hookState.data = {
      campaigns: [
        endedCampaign({
          id: 7,
          displayName: 'تازه تمام شده',
          completedAt: '2026-09-14T12:00:00+03:30',
        }),
      ],
    }

    render(<NmvWidget />)

    expect(screen.getByText('تازه تمام شده')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/campaigns/7')
  })

  test('renders nothing for a campaign that has not started yet', () => {
    hookState.data = {
      campaigns: [
        campaign({
          startAt: '2026-09-20T00:00:00+03:30',
          state: IncentivesCampaignState.upcoming,
        }),
      ],
    }

    const { container } = render(<NmvWidget />)

    expect(container).toBeEmptyDOMElement()
  })

  test('prefers a running campaign over a recently completed one', () => {
    hookState.data = {
      campaigns: [
        endedCampaign({
          id: 1,
          displayName: 'قدیمی',
          completedAt: '2026-09-14T12:00:00+03:30',
        }),
        campaign({ id: 99, displayName: 'کمپین تازه' }),
      ],
    }

    render(<NmvWidget />)

    expect(screen.getByText('کمپین تازه')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/campaigns/99')
  })
})
