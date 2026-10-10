import { memo } from 'react'
import { InView } from 'react-intersection-observer'

import type { FlatListInfiniteProps } from './types'
import { renderSkeletonItems } from './utils'

function FlatListInfiniteComponent<T>(props: FlatListInfiniteProps<T>) {
  const {
    onLoadMore,
    renderDivider,
    renderSkeleton,
    hasMore = true,
    threshold = 0.7,
    loadingMore = false,
    rootMargin = '-40px',
    loadingMoreSkeletonCount = 2,
  } = props

  if (loadingMore && renderSkeleton) {
    return renderSkeletonItems(
      renderSkeleton,
      renderDivider,
      loadingMoreSkeletonCount,
    )
  }

  if (hasMore) {
    return (
      <InView
        threshold={threshold}
        rootMargin={rootMargin}
        onChange={(inView) => {
          if (inView && !loadingMore && onLoadMore) {
            onLoadMore()
          }
        }}
      />
    )
  }

  return null
}

export const FlatListInfinite = memo(
  FlatListInfiniteComponent,
) as typeof FlatListInfiniteComponent
