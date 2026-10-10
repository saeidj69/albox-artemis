import HorizontalProductCardComponent from './HorizontalProductCard'
import HorizontalProductCardSkeletonComponent from './HorizontalProductCard.Skeleton'

const HorizontalProductCard = Object.assign(HorizontalProductCardComponent, {
  Skeleton: HorizontalProductCardSkeletonComponent,
})

export default HorizontalProductCard

export type {
  HorizontalProductCardProps,
  HorizontalProductCardSkeletonProps,
} from './types'
