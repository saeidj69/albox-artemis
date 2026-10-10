import SwitchComponent from './Switch'
import SwitchSkeletonComponent from './Switch.Skeleton'

const Switch = Object.assign(SwitchComponent, {
  Skeleton: SwitchSkeletonComponent,
})

export type { SwitchProps, SwitchSkeletonProps } from './types'

export default Switch
