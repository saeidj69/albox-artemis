import type { IncentivesEvaluatedStep } from '@/api/models'
import type { IncentivesParticipantStep } from '@/api/models'

import {
  readGiftPercentage,
  type NmvViewStepInput,
} from './build-nmv-campaign-view'

export const mapEvaluationStepsToViewInput = (input: {
  evaluationSteps: IncentivesEvaluatedStep[]
  participantSteps?: IncentivesParticipantStep[]
}): NmvViewStepInput[] => {
  const participantSteps = input.participantSteps ?? []

  return input.evaluationSteps.map((step) => {
    const participantStep = participantSteps.find(
      (item) =>
        item.id === step.id || item.campaignStepId === step.campaignStepId,
    )

    return {
      id: step.id,
      position: step.position,
      certainProgress: step.certainProgress,
      target: step.target,
      effectiveAchieved: step.effectiveAchieved,
      progressionLocked: step.progressionLocked,
      percentage:
        readGiftPercentage(step.estimatedReward?.payload) ??
        readGiftPercentage(participantStep?.rewardParams ?? undefined),
    }
  })
}
