import ButtonComponent from './Button'
import ButtonSkeletonComponent from './Button.Skeleton'

const Button = Object.assign(ButtonComponent, {
  Skeleton: ButtonSkeletonComponent,
})

export type { ButtonProps } from './types'

export default Button
