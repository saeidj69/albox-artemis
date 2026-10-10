import ProductCardComponent from './ProductCard'
import ProductCardSkeletonComponent from './ProductCard.Skeleton'

const ProductCard = Object.assign(ProductCardComponent, {
  Skeleton: ProductCardSkeletonComponent,
})

export default ProductCard

export type { ProductCardProps, ProductCardSkeletonProps } from './types'
