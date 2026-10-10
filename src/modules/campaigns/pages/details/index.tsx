'use client'

import { useEffect } from 'react'

import { EVENTS, track, WETransformer } from '@/helpers/analytics'

import PreparedPage from '@/modules/discovery/pages/prepared'

type CampaignDetailsPageProps = {
  campaignId: number
}

const CampaignDetailsPage = ({ campaignId }: CampaignDetailsPageProps) => {
  useEffect(() => {
    if (!Number.isFinite(campaignId)) return

    track(EVENTS.VIEW_CAMPAIGN, {
      webengage: WETransformer.toViewCampaign(campaignId),
    })
  }, [campaignId])

  return <PreparedPage path={`campaign/${campaignId}`} />
}

export default CampaignDetailsPage
