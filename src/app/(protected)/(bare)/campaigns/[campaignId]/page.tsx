import { Metadata, NextPage } from 'next'

import CampaignDetailPage from '@/modules/campaigns/pages/detail'

type PageProps = {
  params: Promise<{ campaignId: string }>
}

export const metadata: Metadata = {
  title: 'مسیر دستیابی به جوایز',
}

const Page: NextPage<PageProps> = async (props) => {
  const { campaignId } = await props.params

  return <CampaignDetailPage campaignId={Number(campaignId)} />
}

export default Page
