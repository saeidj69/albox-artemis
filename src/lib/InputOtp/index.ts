import InputOtpComponent from './InputOtp'
import InputOtpSkeletonComponent from './InputOtp.Skeleton'

const InputOtp = Object.assign(InputOtpComponent, {
  Skeleton: InputOtpSkeletonComponent,
})

export type { InputOtpProps, InputOtpSkeletonProps } from './types'

export default InputOtp
