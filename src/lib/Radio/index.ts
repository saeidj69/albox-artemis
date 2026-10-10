import { RadioGroupComponent, RadioGroupItemComponent } from './Radio'
import RadioGroupSkeletonComponent from './Radio.Skeleton'

const RadioGroup = Object.assign(RadioGroupComponent, {
  Skeleton: RadioGroupSkeletonComponent,
  Item: RadioGroupItemComponent,
})

export default RadioGroup

export type {
  RadioGroupRootProps,
  RadioGroupItemProps,
  RadioGroupSkeletonProps,
} from './types'
