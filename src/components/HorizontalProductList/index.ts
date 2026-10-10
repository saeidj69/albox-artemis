import HorizontalProductListComponent from './HorizontalProductList'
import HorizontalProductListSkeletonComponent from './HorizontalProductList.Skeleton'

const HorizontalProductList = Object.assign(HorizontalProductListComponent, {
  Skeleton: HorizontalProductListSkeletonComponent,
})

export default HorizontalProductList

export type {
  HorizontalProductListProps,
  HorizontalProductListSkeletonProps,
} from './types'
