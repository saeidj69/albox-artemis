'use client'

import { useCallback } from 'react'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { Gift } from 'iconsax-reactjs'

import Animate from '@/components/Animate'
import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useListMyCampaignsInfinite } from '@/modules/campaigns/hooks/use-list-my-campaigns-infinite'

import type { ListMyIncentiveCampaigns200CampaignsItem } from '@/api/models'

import FlatList from '@/lib/FlatList'

import { CampaignHistoryCard } from './components/CampaignHistoryCard'
import { buildCampaignHistoryCardProps } from './utils/build-campaign-history-card'

const CampaignsListPage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useListMyCampaignsInfinite()

  const campaigns = data?.campaigns ?? []

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const renderItem = useCallback(
    (campaign: ListMyIncentiveCampaigns200CampaignsItem, index: number) => (
      <Animate delay={index * 30} animation="slideUp">
        <Link
          href={ROUTES.CAMPAIGNS.detail(campaign.id)}
          prefetch={false}
          className="block"
        >
          <CampaignHistoryCard {...buildCampaignHistoryCardProps(campaign)} />
        </Link>
      </Animate>
    ),
    [],
  )

  const renderSkeleton = useCallback(() => <CampaignHistoryCard.Skeleton />, [])

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton fallback={ROUTES.HOME} />}
          center="سود بی‌نهایت"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="py-4">
        <FlatList
          data={campaigns}
          loading={isLoading}
          skeletonCount={3}
          itemKey="id"
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          className="flex flex-col gap-6"
          emptyContent={
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Gift className="text-text-disabled size-12" />
              <h2 className="typo-title-small">هنوز کمپینی ندارید</h2>
              <p className="typo-body-medium text-text-secondary">
                با ثبت سفارش موفق در بازه کمپین، مسیر جوایز برایتان فعال می‌شود.
              </p>
            </div>
          }
          infiniteOptions={{
            hasMore: hasNextPage,
            onLoadMore: handleLoadMore,
            loadingMore: isFetchingNextPage,
            loadingMoreSkeletonCount: 2,
          }}
        />
      </main>
    </>
  )
}

export default CampaignsListPage
