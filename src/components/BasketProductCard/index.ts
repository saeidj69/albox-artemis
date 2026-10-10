import BasketProductCardComponent from './BasketProductCard'
import BasketProductCardSkeletonComponent from './BasketProductCard.Skeleton'

const BasketProductCard = Object.assign(BasketProductCardComponent, {
  Skeleton: BasketProductCardSkeletonComponent,
})

export default BasketProductCard

export type {
  BasketProductCardProps,
  BasketProductCardSkeletonProps,
} from './types'

export { toListingProduct } from './to-listing-product'
export type { BasketCheckProduct } from './to-listing-product'
