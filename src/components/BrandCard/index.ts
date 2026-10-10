import BrandCardComponent from './BrandCard'
import BrandCardSkeletonComponent from './BrandCard.Skeleton'

const BrandCard = Object.assign(BrandCardComponent, {
  Skeleton: BrandCardSkeletonComponent,
})

export default BrandCard
export type { BrandCardProps, BrandCardSkeletonProps } from './types'
