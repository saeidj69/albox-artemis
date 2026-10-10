import { Metadata, NextPage } from 'next'

import CampaignDetailsPage from '@/modules/campaigns/pages/details'

type PageProps = {
  params: Promise<{ campaignId: string }>
}

export const metadata: Metadata = {
  title: 'کمپین',
}

const Page: NextPage<PageProps> = async (props) => {
  const { campaignId } = await props.params

  return <CampaignDetailsPage campaignId={Number(campaignId)} />
}

export default Page
