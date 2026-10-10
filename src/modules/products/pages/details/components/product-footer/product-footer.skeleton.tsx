import Layout from '@/components/Layout'

import Skeleton from '@/lib/Skeleton'

const ProductFooterBarSkeleton = () => {
  return (
    <Layout.Footer height={64} className="bg-background-main shadow-sm">
      <div className="bg-background-main p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* PriceTag placeholder — discount row + price row */}
          <div className="flex flex-1 flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-6 w-28 rounded" />
          </div>

          {/* AddToCartControl placeholder */}
          <Skeleton className="h-10 w-1/2 rounded" />
        </div>
      </div>
    </Layout.Footer>
  )
}

export default ProductFooterBarSkeleton
