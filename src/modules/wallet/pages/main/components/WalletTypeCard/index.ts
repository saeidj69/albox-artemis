import WalletTypeCardComponent from './WalletTypeCard'
import WalletTypeCardSkeletonComponent from './WalletTypeCard.Skeleton'

const WalletTypeCard = Object.assign(WalletTypeCardComponent, {
  Skeleton: WalletTypeCardSkeletonComponent,
})

export type { WalletTypeCardProps, WalletTypeCardSkeletonProps } from './types'

export default WalletTypeCard
