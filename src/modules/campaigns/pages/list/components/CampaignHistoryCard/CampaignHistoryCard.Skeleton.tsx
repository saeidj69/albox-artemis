import { type FC } from 'react'

import Chip from '@/lib/Chip'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

export type CampaignHistoryCardSkeletonProps = {
  className?: string
}

const CampaignHistoryCardSkeleton: FC<CampaignHistoryCardSkeletonProps> = (
  props,
) => {
  const { className } = props

  return (
    <article
      data-slot="campaign-history-card-skeleton"
      className={cn('flex flex-col gap-3', className)}
    >
      {/* typo-label-medium → line-height 21px */}
      <Skeleton className="h-5.25 w-1/3 rounded-full" />

      <div className="border-border-main rounded-brand flex flex-col gap-2 border p-2">
        <div className="flex items-center gap-2">
          {/* icon circle → size-10 */}
          <Skeleton className="size-10 shrink-0 rounded-full" />

          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between gap-2">
              {/* typo-body-small → line-height 18px */}
              <Skeleton className="h-4.5 w-1/3 rounded-full" />
              {/* Chip size="small" → h-5 */}
              <Chip.Skeleton size="small" className="w-28" />
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              {/* typo-label-small → line-height 18px */}
              <Skeleton className="h-4.5 w-1/4 rounded-full" />
              <Skeleton className="h-4.5 w-1/2 rounded-full" />
            </div>
          </div>
        </div>

        {/* typo-body-small footer → line-height 18px */}
        <Skeleton className="h-4.5 w-full rounded-full" />
      </div>
    </article>
  )
}

export default CampaignHistoryCardSkeleton
