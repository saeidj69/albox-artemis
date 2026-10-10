import BarookWalletCardComponent from './BarookWalletCard'
import BarookWalletCardSkeletonComponent from './BarookWalletCard.Skeleton'

const BarookWalletCard = Object.assign(BarookWalletCardComponent, {
  Skeleton: BarookWalletCardSkeletonComponent,
})

export type {
  BarookWalletCardProps,
  BarookWalletCardSkeletonProps,
} from './types'

export default BarookWalletCard
