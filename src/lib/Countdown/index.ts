import CountdownComponent from './Countdown'
import CountdownSkeletonComponent from './Countdown.Skeleton'

const Countdown = Object.assign(CountdownComponent, {
  Skeleton: CountdownSkeletonComponent,
})

export type { CountdownProps, CountdownSkeletonProps } from './types'
export type { CountdownSegments, UseCountdownResult } from './useCountdown'
export { toCountdownSegments, useCountdown } from './useCountdown'

export default Countdown
