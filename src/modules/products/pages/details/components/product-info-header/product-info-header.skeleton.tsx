import Skeleton from '@/lib/Skeleton'

const ProductInfoHeaderSkeleton = () => {
  return (
    <>
      {/* Title — matches typo-label-medium my-2 */}
      <Skeleton className="my-2 h-6 w-3/4 rounded" />

      {/* Brand link + unit chip row */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
    </>
  )
}

export default ProductInfoHeaderSkeleton
