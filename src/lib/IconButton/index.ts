import IconButtonComponent from './IconButton'
import IconButtonSkeletonComponent from './IconButton.Skeleton'

const IconButton = Object.assign(IconButtonComponent, {
  Skeleton: IconButtonSkeletonComponent,
})

export type { IconButtonProps, IconButtonSkeletonProps } from './types'

export default IconButton
