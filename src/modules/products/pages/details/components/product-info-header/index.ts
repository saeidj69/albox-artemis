import ProductInfoHeaderComponent from './product-info-header'
import ProductInfoHeaderSkeletonComponent from './product-info-header.skeleton'

const ProductInfoHeader = Object.assign(ProductInfoHeaderComponent, {
  Skeleton: ProductInfoHeaderSkeletonComponent,
})

export default ProductInfoHeader
