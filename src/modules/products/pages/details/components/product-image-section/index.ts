import ProductImageSectionComponent from './product-image-section'
import ProductImageSectionSkeletonComponent from './product-image-section.skeleton'

const ProductImageSection = Object.assign(ProductImageSectionComponent, {
  Skeleton: ProductImageSectionSkeletonComponent,
})

export default ProductImageSection
