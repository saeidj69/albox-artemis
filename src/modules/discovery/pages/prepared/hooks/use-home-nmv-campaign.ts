'use client'

import { useMemo } from 'react'

import { useActiveCampaign } from '@/hooks/useActiveCampaign'

import { buildNmvCampaignView } from '@/modules/campaigns/utils/build-nmv-campaign-view'
import { mapEvaluationStepsToViewInput } from '@/modules/campaigns/utils/map-evaluation-steps'

/**
 * The home NMV card is client-only: the page builder cannot know which
 * incentive campaign (if any) is live for this profile.
 */
export const useHomeNmvCampaign = (enabled = true) => {
  const { campaign, isPending } = useActiveCampaign(enabled)

  const view = useMemo(() => {
    if (!campaign) return null

    return buildNmvCampaignView({
      displayName: campaign.displayName,
      steps: mapEvaluationStepsToViewInput({
        evaluationSteps: campaign.participant.evaluation?.steps ?? [],
        participantSteps: campaign.participant.steps ?? [],
      }),
    })
  }, [campaign])

  const show = Boolean(campaign && view && view.trackSteps.length > 0)

  return { campaign, view, show, isPending }
}
