import { describe, expect, test } from 'vitest'

import type { IncentivesEvaluatedStep } from '@/api/models'
import type { IncentivesParticipantStep } from '@/api/models'
import { IncentivesRewardType } from '@/api/models'

import { mapEvaluationStepsToViewInput } from './map-evaluation-steps'

const evaluationStep = (
  overrides: Partial<IncentivesEvaluatedStep> &
    Pick<IncentivesEvaluatedStep, 'id' | 'campaignStepId' | 'position'>,
): IncentivesEvaluatedStep =>
  ({
    title: 'Step',
    certainProgress: 0,
    possibleProgress: 0,
    target: 100_000_000,
    achieved: false,
    effectiveAchieved: false,
    progressionLocked: false,
    details: {},
    rewardResolved: false,
    estimatedReward: null,
    ...overrides,
  }) as IncentivesEvaluatedStep

const participantStep = (
  overrides: Partial<IncentivesParticipantStep> &
    Pick<IncentivesParticipantStep, 'id' | 'campaignStepId'>,
): IncentivesParticipantStep =>
  ({
    ruleParams: {},
    rewardParams: null,
    campaignStep: null,
    ...overrides,
  }) as IncentivesParticipantStep

describe('mapEvaluationStepsToViewInput', () => {
  test('maps evaluation fields and prefers estimatedReward percentage', () => {
    const result = mapEvaluationStepsToViewInput({
      evaluationSteps: [
        evaluationStep({
          id: 1,
          campaignStepId: 10,
          position: 1,
          certainProgress: 50_000_000,
          target: 200_000_000,
          effectiveAchieved: true,
          progressionLocked: false,
          estimatedReward: {
            type: IncentivesRewardType.gift_percentage_over_finalized_orders_net_total,
            payload: { percentage: 0.02 },
          },
        }),
      ],
      participantSteps: [
        participantStep({
          id: 1,
          campaignStepId: 10,
          rewardParams: { percentage: 0.01 },
        }),
      ],
    })

    expect(result).toEqual([
      {
        id: 1,
        position: 1,
        certainProgress: 50_000_000,
        target: 200_000_000,
        effectiveAchieved: true,
        progressionLocked: false,
        percentage: 0.02,
      },
    ])
  })

  test('falls back to participant rewardParams when estimatedReward is missing', () => {
    const result = mapEvaluationStepsToViewInput({
      evaluationSteps: [
        evaluationStep({
          id: 2,
          campaignStepId: 20,
          position: 2,
          estimatedReward: null,
        }),
      ],
      participantSteps: [
        participantStep({
          id: 99,
          campaignStepId: 20,
          rewardParams: { percentage: 0.015 },
        }),
      ],
    })

    expect(result[0]?.percentage).toBe(0.015)
  })

  test('matches participant steps by evaluation step id when campaignStepId differs', () => {
    const result = mapEvaluationStepsToViewInput({
      evaluationSteps: [
        evaluationStep({
          id: 7,
          campaignStepId: 70,
          position: 1,
          estimatedReward: null,
        }),
      ],
      participantSteps: [
        participantStep({
          id: 7,
          campaignStepId: 999,
          rewardParams: { percentage: 0.03 },
        }),
      ],
    })

    expect(result[0]?.percentage).toBe(0.03)
  })

  test('returns null percentage when neither reward source is valid', () => {
    const result = mapEvaluationStepsToViewInput({
      evaluationSteps: [
        evaluationStep({
          id: 3,
          campaignStepId: 30,
          position: 1,
          estimatedReward: null,
        }),
      ],
      participantSteps: [],
    })

    expect(result[0]?.percentage).toBeNull()
  })
})
