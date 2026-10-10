'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import {
  buildCurvePath,
  type StepAnchor,
} from './components/MilestonePath'

const SKELETON_COUNT = 3
const DASH_ARRAY = '12 12'

export type CampaignMilestonesSkeletonProps = {
  className?: string
}

const CampaignMilestonesSkeleton = (
  props: CampaignMilestonesSkeletonProps,
) => {
  const { className } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [paths, setPaths] = useState<string[]>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const update = () => {
      const containerRect = container.getBoundingClientRect()
      const anchors: StepAnchor[] = []

      for (let index = 0; index < SKELETON_COUNT; index += 1) {
        const node = stepRefs.current[index]
        if (!node) {
          continue
        }

        const rect = node.getBoundingClientRect()
        anchors.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          top: rect.top - containerRect.top,
          bottom: rect.bottom - containerRect.top,
        })
      }

      if (anchors.length < 2) {
        setPaths([])
        return
      }

      const nextPaths: string[] = []
      for (let index = 0; index < anchors.length - 1; index += 1) {
        nextPaths.push(buildCurvePath(anchors[index]!, anchors[index + 1]!))
      }
      setPaths(nextPaths)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(container)
    stepRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="campaign-milestones-skeleton"
      className={cn('relative flex flex-col gap-20', className)}
    >
      {paths.length > 0 ? (
        <svg
          data-slot="campaign-milestones-skeleton-path"
          className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
          aria-hidden
        >
          {paths.map((d, index) => (
            <path
              key={index}
              d={d}
              fill="none"
              stroke="var(--color-background-disabled)"
              strokeWidth={2}
              strokeDasharray={DASH_ARRAY}
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : null}

      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className={cn(
            'relative z-10 flex items-center gap-3',
            index % 2 === 0 ? 'flex-row' : 'flex-row-reverse',
          )}
        >
          <div
            ref={(node) => {
              stepRefs.current[index] = node
            }}
            className="shrink-0"
          >
            <Skeleton className="bg-background-disabled size-18 rounded-full" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="bg-background-disabled h-[21px] w-full rounded-full" />
            <Skeleton className="bg-background-disabled h-[21px] w-4/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CampaignMilestonesSkeleton
