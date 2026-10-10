import CategoryCardComponent from './CategoryCard'
import CategoryCardSkeletonComponent from './CategoryCard.Skeleton'

const CategoryCard = Object.assign(CategoryCardComponent, {
  Skeleton: CategoryCardSkeletonComponent,
})

export default CategoryCard
export type { CategoryCardProps, CategoryCardSkeletonProps } from './types'
