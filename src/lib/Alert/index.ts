import AlertComponent from './Alert'
import AlertSkeletonComponent from './Alert.Skeleton'

export type { AlertProps, AlertSkeletonProps } from './types'
export type { AlertSlots, AlertSkeletonSlots } from './variants'

const Alert = Object.assign(AlertComponent, {
  Skeleton: AlertSkeletonComponent,
})

export default Alert
