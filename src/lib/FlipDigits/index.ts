import FlipDigitsComponent from './FlipDigits'
import FlipDigitsSkeletonComponent from './FlipDigits.Skeleton'

const FlipDigits = Object.assign(FlipDigitsComponent, {
  Skeleton: FlipDigitsSkeletonComponent,
})

export type { FlipDigitsProps, FlipDigitsSkeletonProps } from './types'

export default FlipDigits
