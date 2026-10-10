import AspectRatio from '@/lib/AspectRatio'
import Skeleton from '@/lib/Skeleton'

const ProductImageSectionSkeleton = () => {
  return (
    <div className="-mx-4">
      <AspectRatio ratio={4 / 3}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
    </div>
  )
}

export default ProductImageSectionSkeleton
