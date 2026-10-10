import DropdownComponent from './Dropdown'
import DropdownSkeletonComponent from './Dropdown.Skeleton'

const Dropdown = Object.assign(DropdownComponent, {
  Skeleton: DropdownSkeletonComponent,
})

export default Dropdown
export type {
  DropdownOption,
  DropdownProps,
  DropdownSkeletonProps,
} from './types'
