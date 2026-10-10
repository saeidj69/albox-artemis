import InfoListComponent from './InfoList'
import InfoListSkeletonComponent from './InfoList.Skeleton'

const InfoList = Object.assign(InfoListComponent, {
  Skeleton: InfoListSkeletonComponent,
})

export default InfoList

export type {
  InfoListItem,
  InfoListProps,
  InfoListSkeletonProps,
} from './types'
