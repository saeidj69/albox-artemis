import { Fragment, memo, useMemo, type ReactNode } from 'react'

import { FlatListInfinite } from './FlatList.Infinite'
import type { FlatListProps } from './types'
import { renderListItems, renderSkeletonItems } from './utils'
import { flatListVariants } from './variants'

function FlatListComponent<T>(props: FlatListProps<T>) {
  const {
    data = [],
    itemKey,
    nodeRef,
    fragment,
    className,
    renderItem,
    emptyContent,
    headerContent,
    footerContent,
    renderDivider,
    renderSkeleton,
    infiniteOptions,
    loading = false,
    skeletonCount = 4,
    direction = 'vertical',
    ...rest
  } = props

  const content = useMemo<ReactNode>(() => {
    if (loading && renderSkeleton) {
      return renderSkeletonItems(renderSkeleton, renderDivider, skeletonCount)
    }

    if (!loading && data.length === 0) {
      return emptyContent
    }

    return renderListItems(data, renderItem, renderDivider, itemKey)
  }, [
    loading,
    renderSkeleton,
    data,
    renderItem,
    renderDivider,
    itemKey,
    skeletonCount,
    emptyContent,
  ])

  const wrappedContent = useMemo<ReactNode>(
    () => (
      <Fragment>
        {headerContent}
        {content}
        {footerContent}
        {infiniteOptions && (
          <FlatListInfinite
            {...infiniteOptions}
            renderSkeleton={renderSkeleton}
            renderDivider={renderDivider}
          />
        )}
      </Fragment>
    ),
    [
      headerContent,
      content,
      footerContent,
      infiniteOptions,
      renderSkeleton,
      renderDivider,
    ],
  )

  if (fragment) return wrappedContent

  return (
    <div
      {...rest}
      ref={nodeRef}
      className={flatListVariants({ direction, className })}
    >
      {wrappedContent}
    </div>
  )
}

/**
 * # FlatList
 * @param props - FlatListProps
 * @description Flexible list component for rendering arrays of items with support for loading states, dividers, and custom rendering. Can render as a container div or as a fragment.
 * @example
 * <FlatList
 *   items={data}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   itemKey="id"
 * />
 * @example
 * <FlatList
 *   items={data}
 *   loading={true}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   renderSkeleton={(index) => <Skeleton key={index} />}
 *   skeletonCount={5}
 * />
 * @example
 * <FlatList
 *   items={data}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   renderDivider={() => <Divider />}
 *   direction="horizontal"
 * />
 * @example
 * <FlatList
 *   items={data}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   emptyPlaceholder={<EmptyState />}
 *   fragment={true}
 * />
 * @example
 * <FlatList
 *   items={data}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   onLoadMore={() => loadNextPage()}
 *   hasMore={hasNextPage}
 *   loadingMore={isLoadingMore}
 *   renderSkeleton={<Skeleton />}
 * />
 */
const FlatList = memo(FlatListComponent) as typeof FlatListComponent

export default FlatList

export type { FlatListProps }
