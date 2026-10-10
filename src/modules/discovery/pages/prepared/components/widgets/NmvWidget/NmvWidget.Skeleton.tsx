import type { ComponentProps } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import NmvWidgetLayout from './NmvWidget.Layout'

type NmvWidgetSkeletonProps = ComponentProps<'section'>

export const NmvWidgetSkeletonComponent = (props: NmvWidgetSkeletonProps) => {
  const { className, ...rest } = props

  return (
    <section
      data-slot="nmv-widget-skeleton"
      className={cn(className)}
      {...rest}
    >
      <NmvWidgetLayout>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex h-[21px] items-center gap-1">
              <Skeleton className="size-5 shrink-0 rounded" />
              <Skeleton className="h-[14px] w-40 rounded-full" />
            </div>

            <div className="mt-2 mr-6 flex h-4 items-center gap-0">
              <Skeleton className="h-[10px] w-36 rounded-full" />
              <Skeleton className="size-4 shrink-0 rounded-sm" />
            </div>
          </div>

          <div className="flex shrink-0 items-start">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-start">
                {index > 0 ? (
                  <span className="typo-label-medium mt-0.5 flex items-center px-1 opacity-0">
                    :
                  </span>
                ) : null}

                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="size-6 rounded-lg" />
                  <div className="flex h-[15px] items-center">
                    <Skeleton className="h-[10px] w-6 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex h-[21px] items-center">
          <Skeleton className="h-[12px] w-full rounded-full" />
        </div>

        <div className="mt-2">
          <div className="flex h-6 items-center gap-1">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  'flex min-w-0 items-center gap-1',
                  index < 2 && 'flex-1',
                )}
              >
                <Skeleton className="size-5 shrink-0 rounded-full" />
                {index < 2 ? (
                  <Skeleton className="h-1.5 min-w-12 flex-1 rounded-full" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </NmvWidgetLayout>
    </section>
  )
}
