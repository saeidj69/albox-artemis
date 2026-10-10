import TextAreaComponent from './TextArea'
import TextAreaSkeletonComponent from './TextArea.Skeleton'

const TextArea = Object.assign(TextAreaComponent, {
  Skeleton: TextAreaSkeletonComponent,
})

export type { TextAreaProps, TextAreaSkeletonProps } from './types'

export default TextArea
