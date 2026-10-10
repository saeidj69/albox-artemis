import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { GetMyIncentiveCampaign200 } from '@/api/models'
import { IncentivesRewardType } from '@/api/models'

import CampaignMilestones from './index'

const hookState: { data: GetMyIncentiveCampaign200 | undefined } = {
  data: undefined,
}

vi.mock('@/api/functions/incentives', () => ({
  useGetMyIncentiveCampaign: () => hookState,
}))

vi.mock('./components/MilestonePath', () => ({
  MilestonePath: () => null,
  useMilestonePaths: () => ({
    containerRef: { current: null },
    registerStep: () => {},
    paths: [],
  }),
}))

const evaluatedStep = (overrides: {
  id: number
  position: number
  target: number
  certainProgress: number
  achieved?: boolean
  percentage?: number | null
}) => ({
  id: overrides.id,
  campaignStepId: overrides.id * 10,
  position: overrides.position,
  title: `Step ${overrides.position}`,
  certainProgress: overrides.certainProgress,
  possibleProgress: 0,
  target: overrides.target,
  achieved: overrides.achieved ?? false,
  effectiveAchieved: overrides.achieved ?? false,
  progressionLocked: false,
  details: {},
  rewardResolved: false,
  estimatedReward:
    overrides.percentage === null
      ? null
      : {
          type: IncentivesRewardType.gift_percentage_over_finalized_orders_net_total,
          payload: { percentage: overrides.percentage ?? 0.01 },
        },
})

const detail = (
  steps: ReturnType<typeof evaluatedStep>[],
): GetMyIncentiveCampaign200 =>
  ({
    campaign: { id: 42, displayName: 'کمپین' },
    participant: { id: 1, steps: [] },
    evaluation: {
      isFinal: false,
      steps,
      resolvedStepIds: [],
      estimatedRewards: [],
    },
  }) as unknown as GetMyIncentiveCampaign200

const twoSteps = (certainProgress: number) => [
  evaluatedStep({
    id: 2,
    position: 2,
    target: 400_000_000,
    certainProgress,
    percentage: 0.02,
  }),
  evaluatedStep({
    id: 1,
    position: 1,
    target: 200_000_000,
    certainProgress,
    achieved: certainProgress >= 200_000_000,
    percentage: 0.01,
  }),
]

const ZERO_STAGE_COPY =
  'مرحله‌ی صفر! با هر سفارش موفق در آل‌باکس، یک قدم به ٪۱ اعتبار هدیه نزدیک شو.'

describe('CampaignMilestones zero stage', () => {
  beforeEach(() => {
    hookState.data = undefined
  })

  test('shows the first step percentage before any progress', () => {
    hookState.data = detail(twoSteps(0))

    render(<CampaignMilestones campaignId={42} />)

    expect(screen.getByText(ZERO_STAGE_COPY)).toBeInTheDocument()
  })

  test('keeps the same static copy after progress and achieved steps', () => {
    hookState.data = detail(twoSteps(300_000_000))

    render(<CampaignMilestones campaignId={42} />)

    expect(screen.getByText(ZERO_STAGE_COPY)).toBeInTheDocument()
    expect(screen.queryByText(/فقط/)).not.toBeInTheDocument()
  })

  test('omits the percentage when no step has a gift percentage', () => {
    hookState.data = detail([
      evaluatedStep({
        id: 1,
        position: 1,
        target: 200_000_000,
        certainProgress: 0,
        percentage: null,
      }),
    ])

    render(<CampaignMilestones campaignId={42} />)

    expect(
      screen.getByText(
        'مرحله‌ی صفر! با هر سفارش موفق در آل‌باکس، یک قدم به اعتبار هدیه نزدیک شو.',
      ),
    ).toBeInTheDocument()
  })

  test('renders nothing while the campaign is loading', () => {
    const { container } = render(<CampaignMilestones campaignId={42} />)

    expect(container).toBeEmptyDOMElement()
  })
})
