import { AddressItemComponent } from './AddressItem'
import AddressItemSkeletonComponent from './AddressItem.Skeleton'

const AddressItem = Object.assign(AddressItemComponent, {
  Skeleton: AddressItemSkeletonComponent,
})

export default AddressItem
export type { AddressItemProps, AddressItemSkeletonProps } from './types'
