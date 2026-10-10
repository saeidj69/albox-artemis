'use client'

import { useCallback } from 'react'

import { useListClientPlays } from '@/api/functions/tyche/client'
import type { ClientPlayHistoryItem } from '@/api/models/tyche'

import Divider from '@/lib/Divider'
import FlatList from '@/lib/FlatList'
import Skeleton from '@/lib/Skeleton'

import { formatPlayDate, formatPlayReward } from './utils'

const PLAYS_PER_PAGE = 5

const PlayHistoryItem = ({ play }: { play: ClientPlayHistoryItem }) => {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="typo-body-medium text-text-secondary shrink-0">
        {formatPlayDate(play.createdAt)}
      </span>

      <span className="typo-body-medium text-text-primary min-w-0">
        {formatPlayReward(play.reward)}
      </span>
    </div>
  )
}

const PlayHistoryItemSkeleton = () => (
  <div className="flex items-center justify-between gap-3 py-3">
    <Skeleton className="h-5 w-24" />
    <Skeleton className="h-5 w-40" />
  </div>
)

const PlaysHistory = () => {
  const { data, isLoading } = useListClientPlays({
    limit: PLAYS_PER_PAGE,
  })

  const plays = data?.plays ?? []

  const renderItem = useCallback(
    (play: ClientPlayHistoryItem) => <PlayHistoryItem play={play} />,
    [],
  )

  const renderSkeleton = useCallback(() => <PlayHistoryItemSkeleton />, [])

  const renderDivider = useCallback(() => <Divider />, [])

  if (!isLoading && plays.length === 0) {
    return null
  }

  return (
    <section className="rounded-brand bg-background-main border-border-main border p-4">
      <h2 className="typo-title-small text-text-primary mb-2">
        جوایز اخیر شما
      </h2>

      <FlatList
        data={plays}
        loading={isLoading}
        skeletonCount={3}
        itemKey="id"
        renderItem={renderItem}
        renderSkeleton={renderSkeleton}
        renderDivider={renderDivider}
      />
    </section>
  )
}

export default PlaysHistory
