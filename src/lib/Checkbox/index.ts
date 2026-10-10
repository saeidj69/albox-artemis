import CheckboxComponent from './Checkbox'
import CheckboxSkeletonComponent from './Checkbox.Skeleton'

const Checkbox = Object.assign(CheckboxComponent, {
  Skeleton: CheckboxSkeletonComponent,
})

export type { CheckboxProps, CheckboxSkeletonProps } from './types'

export default Checkbox
