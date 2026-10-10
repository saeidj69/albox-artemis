import InputComponent from './Input'
import InputSkeletonComponent from './Input.Skeleton'

const Input = Object.assign(InputComponent, {
  Skeleton: InputSkeletonComponent,
})

export default Input
export type { InputProps, InputSkeletonProps } from './types'
