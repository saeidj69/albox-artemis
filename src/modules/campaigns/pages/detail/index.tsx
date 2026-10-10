'use client'

import Link from 'next/link'

import { ROUTES } from '@/constants'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useGetMyIncentiveCampaign } from '@/api/functions/incentives'

import Button from '@/lib/Button'

import CampaignMilestones from './components/CampaignMilestones'
import CampaignSummaryCard from './components/CampaignSummaryCard'

type CampaignDetailPageProps = {
  campaignId: number
}

const CampaignDetailPage = (props: CampaignDetailPageProps) => {
  const { campaignId } = props

  const { data } = useGetMyIncentiveCampaign(campaignId, {
    query: { enabled: !!campaignId },
  })

  if (!data) {
    return (
      <>
        <Layout.Header height={64}>
          <Header
            right={<HeaderBackButton />}
            center="جزئیات کمپین"
            left={<HeaderLogo />}
          />
        </Layout.Header>

        <main className="flex flex-col gap-6 py-4">
          <CampaignSummaryCard.Skeleton />
          <CampaignMilestones.Skeleton />
        </main>
      </>
    )
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton fallback={ROUTES.CAMPAIGNS.ROOT} />}
          center={data?.campaign?.displayName ?? 'جزئیات کمپین'}
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="flex flex-col gap-6 py-4">
        <CampaignSummaryCard campaignId={campaignId} />

        <CampaignMilestones campaignId={campaignId} />
      </main>

      <Layout.Footer height={80} className="bg-background-main">
        <div className="p-4">
          <Button
            as={Link}
            replace
            href={ROUTES.CAMPAIGNS.ROOT}
            prefetch={false}
            size="large"
            className="w-full"
          >
            تاریخچه‌ی جوایز من
          </Button>
        </div>
      </Layout.Footer>
    </>
  )
}

export default CampaignDetailPage
