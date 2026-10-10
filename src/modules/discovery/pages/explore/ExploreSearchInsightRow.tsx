'use client'

import type { ComponentType, ReactNode } from 'react'

import { RiArrowLeftSLine } from '@remixicon/react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils/cn'

const rowButtonClassName =
  'typo-label-medium text-text-primary hover:bg-background-secondary flex min-h-11 w-full items-center justify-between gap-2'

export type ExploreSearchInsightRowProps = {
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  children: ReactNode
  className?: string
}

const ExploreSearchInsightRow = (props: ExploreSearchInsightRowProps) => {
  const { icon: Icon, onClick, children, className } = props

  return (
    <button
      type="button"
      className={cn(rowButtonClassName, className)}
      onClick={onClick}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 text-start">{children}</span>
      </div>

      <RiArrowLeftSLine className="size-4 shrink-0" />
    </button>
  )
}

export type ExploreSearchInsightRowSkeletonProps = {
  className?: string
}

const ExploreSearchInsightRowSkeleton = (
  props: ExploreSearchInsightRowSkeletonProps,
) => {
  const { className } = props

  return (
    <div
      className={cn(
        'flex min-h-11 w-full items-center justify-between gap-2',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Skeleton className="size-4 shrink-0 rounded" />
        <Skeleton className="h-4 min-w-0 flex-1 rounded" />
      </div>
      <Skeleton className="size-4 shrink-0 rounded" />
    </div>
  )
}

export default Object.assign(ExploreSearchInsightRow, {
  Skeleton: ExploreSearchInsightRowSkeleton,
})
