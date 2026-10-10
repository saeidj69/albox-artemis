import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

export type CampaignSummaryCardSkeletonProps = {
  className?: string
}

const CampaignSummaryCardSkeleton = (
  props: CampaignSummaryCardSkeletonProps,
) => {
  const { className } = props

  return (
    <section
      data-slot="campaign-summary-card-skeleton"
      className={cn(
        'border-border-darker rounded-brand border bg-white p-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {/* typo-label-medium → line-height 21px */}
        <Skeleton className="h-5.25 w-36 rounded-full" />

        {/* Chip size="medium" → h-6 */}
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {/* typo-body-medium → line-height 21px × 3 rows */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5.25 w-1/2 rounded-full" />
          <Skeleton className="h-5.25 w-1/3 rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5.25 w-1/3 rounded-full" />
          <Skeleton className="h-5.25 w-1/5 rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5.25 w-1/2 rounded-full" />
          <Skeleton className="h-5.25 w-1/4 rounded-full" />
        </div>
      </div>
    </section>
  )
}

export default CampaignSummaryCardSkeleton
