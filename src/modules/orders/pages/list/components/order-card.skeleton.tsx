import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

type OrderCardSkeletonProps = {
  className?: string
}

const OrderCardSkeleton = ({ className }: OrderCardSkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-background-main border-border-main rounded-brand grid gap-3 border p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-64" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export default OrderCardSkeleton
