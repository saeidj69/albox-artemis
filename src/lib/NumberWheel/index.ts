import NumberWheelComponent from './NumberWheel'
import NumberWheelSkeletonComponent from './NumberWheel.Skeleton'

const NumberWheel = Object.assign(NumberWheelComponent, {
  Skeleton: NumberWheelSkeletonComponent,
})

export type { NumberWheelProps, NumberWheelSkeletonProps } from './types'

export default NumberWheel
