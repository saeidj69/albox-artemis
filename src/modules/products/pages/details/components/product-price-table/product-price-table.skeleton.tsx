import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

const ROW_COUNT = 5

const ProductPriceTableSkeleton = () => {
  return (
    <div className="border-border-lighter overflow-hidden rounded-lg border bg-white">
      {Array.from({ length: ROW_COUNT }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'border-border-lighter flex items-center justify-between border-b px-4 py-4 last:border-b-0',
            index % 2 === 0 && 'bg-background-secondary',
          )}
        >
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

export default ProductPriceTableSkeleton
