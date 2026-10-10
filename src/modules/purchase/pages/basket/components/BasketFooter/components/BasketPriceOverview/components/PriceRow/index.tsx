import type { ReactNode } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

type PriceRowProps = {
  label: ReactNode
  value: ReactNode
  className?: string
}

type PriceRowSkeletonProps = {
  className?: string
}

const PriceRowComponent = ({ label, value, className }: PriceRowProps) => (
  <div
    data-slot="price-row"
    className={cn('flex items-center justify-between', className)}
  >
    <span className="typo-label-medium text-text-secondary">{label}</span>
    {value}
  </div>
)

const PriceRowSkeletonComponent = ({ className }: PriceRowSkeletonProps) => (
  <div
    data-slot="price-row-skeleton"
    className={cn('flex items-center justify-between py-0.5', className)}
  >
    <Skeleton className="h-4 w-32 rounded" />
    <Skeleton className="h-4 w-20 rounded" />
  </div>
)

const PriceRow = Object.assign(PriceRowComponent, {
  Skeleton: PriceRowSkeletonComponent,
})

export default PriceRow
export type { PriceRowProps, PriceRowSkeletonProps }
