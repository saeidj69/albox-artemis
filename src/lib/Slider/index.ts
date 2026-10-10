import SliderComponent from './Slider'
import SliderSkeletonComponent from './Slider.Skeleton'

const Slider = Object.assign(SliderComponent, {
  Skeleton: SliderSkeletonComponent,
})

export type { SliderProps, SliderSkeletonProps } from './types'

export default Slider
