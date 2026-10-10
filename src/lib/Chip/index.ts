import ChipComponent from './Chip'
import ChipSkeletonComponent from './Chip.Skeleton'

const Chip = Object.assign(ChipComponent, {
  Skeleton: ChipSkeletonComponent,
})

export default Chip
