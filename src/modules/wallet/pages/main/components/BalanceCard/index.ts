import BalanceCardComponent from './BalanceCard'
import BalanceCardSkeletonComponent from './BalanceCard.Skeleton'

const BalanceCard = Object.assign(BalanceCardComponent, {
  Skeleton: BalanceCardSkeletonComponent,
})

export type { BalanceCardProps, BalanceCardSkeletonProps } from './types'

export default BalanceCard
