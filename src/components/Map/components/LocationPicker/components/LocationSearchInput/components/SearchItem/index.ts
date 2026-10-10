import SearchItemComponent from './SearchItem'
import SearchItemSkeletonComponent from './SearchItem.Skeleton'

const SearchItem = Object.assign(SearchItemComponent, {
  Skeleton: SearchItemSkeletonComponent,
})

export default SearchItem
export type { SearchItemProps, SearchItemSkeletonProps } from './types'
