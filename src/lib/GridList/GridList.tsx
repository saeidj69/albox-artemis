import {
  Fragment,
  memo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useIsDesktop } from '@/hooks/useIsDesktop'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { chunk } from 'lodash'

import FlatList from '@/lib/FlatList'
import { FlatListInfinite } from '@/lib/FlatList/FlatList.Infinite'
import { renderListItems, renderSkeletonItems } from '@/lib/FlatList/utils'
import { flatListVariants } from '@/lib/FlatList/variants'

import { cn } from '../utils'
import type { GridListProps } from './types'

type EmblaDesktopScrollProps = {
  children: ReactNode
  emblaOptions?: EmblaOptionsType
} & HTMLAttributes<HTMLDivElement>

function EmblaDesktopScroll(props: EmblaDesktopScrollProps) {
  const { children, className, emblaOptions, ...rest } = props

  const options: EmblaOptionsType = {
    axis: 'x',
    align: 'start',
    ...emblaOptions,
  }

  const [emblaRef] = useEmblaCarousel(options)

  return (
    <div className="overflow-hidden" ref={emblaRef} {...rest}>
      <div className={cn('flex min-w-0 touch-pan-y', className)}>
        {children}
      </div>
    </div>
  )
}

type HorizontalScrollAreaProps = {
  children: ReactNode
  isDesktop: boolean
  emblaOptions?: EmblaOptionsType
  mobileScrollSnapClassName?: string
  loading?: boolean
} & HTMLAttributes<HTMLDivElement>

function HorizontalScrollArea(props: HorizontalScrollAreaProps) {
  const {
    children,
    isDesktop,
    emblaOptions,
    mobileScrollSnapClassName,
    loading,
    className,
    ...rest
  } = props

  if (loading) {
    return (
      <div className={cn('flex overflow-x-hidden', className)} {...rest}>
        {children}
      </div>
    )
  }

  if (isDesktop) {
    return (
      <EmblaDesktopScroll
        className={className}
        emblaOptions={emblaOptions}
        {...rest}
      >
        {children}
      </EmblaDesktopScroll>
    )
  }

  return (
    <div
      className={cn(
        'flex min-w-0 flex-row overflow-x-auto overflow-y-hidden',
        mobileScrollSnapClassName,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

function wrapSlides(
  nodes: ReactElement[] | null,
  mobileItemSnapClassName: string | undefined,
  isDesktop: boolean,
): ReactNode {
  if (!nodes) {
    return null
  }

  return nodes.map((el) => (
    <div
      key={el.key}
      className={cn('min-w-0 shrink-0', !isDesktop && mobileItemSnapClassName)}
    >
      {el}
    </div>
  ))
}

function GridListComponent<T>(props: GridListProps<T>) {
  const {
    rows,
    columns,
    rowClassName,
    columnClassName,
    rowContainerProps,
    columnContainerProps,
    emblaOptions,
    mobileScrollSnapClassName,
    mobileItemSnapClassName,
    ...flatListProps
  } = props

  const isDesktop = useIsDesktop()

  const {
    data,
    itemKey,
    headerContent,
    footerContent,
    loading,
    renderItem,
    renderSkeleton,
    emptyContent,
    renderDivider,
    skeletonCount = 4,
    infiniteOptions,
    nodeRef,
    className,
    fragment,
    ...restFlatListProps
  } = flatListProps

  let rowsCount: number = rows

  const length = data?.length ?? 0

  if (length) {
    const isOverlap = columns * rowsCount > length

    while (rowsCount > 1 && isOverlap) {
      rowsCount = rowsCount - 1
    }
  }

  let singleRowListContent: ReactElement[] | ReactNode | null = null

  if (rowsCount === 1) {
    if (loading && renderSkeleton) {
      singleRowListContent = renderSkeletonItems(
        renderSkeleton,
        renderDivider,
        skeletonCount,
      )
    } else if (!loading && (data?.length ?? 0) === 0) {
      singleRowListContent = emptyContent
    } else {
      singleRowListContent = renderListItems(
        data ?? [],
        renderItem,
        renderDivider,
        itemKey,
      )
    }
  }

  const scrollKey = `${isDesktop ? 'd' : 'm'}-${loading ? 'l' : 'r'}`

  if (rowsCount === 1) {
    const listBody = Array.isArray(singleRowListContent)
      ? wrapSlides(singleRowListContent, mobileItemSnapClassName, isDesktop)
      : singleRowListContent

    if (fragment) {
      return (
        <Fragment>
          {headerContent}
          <HorizontalScrollArea
            key={scrollKey}
            isDesktop={isDesktop}
            emblaOptions={emblaOptions}
            mobileScrollSnapClassName={mobileScrollSnapClassName}
            loading={Boolean(loading)}
            {...rowContainerProps}
            className={cn(rowClassName, rowContainerProps?.className)}
          >
            {listBody}
          </HorizontalScrollArea>
          {footerContent}
          {infiniteOptions && (
            <FlatListInfinite
              {...infiniteOptions}
              renderSkeleton={renderSkeleton}
              renderDivider={renderDivider}
            />
          )}
        </Fragment>
      )
    }

    return (
      <div
        ref={nodeRef}
        className={cn(flatListVariants({ direction: 'vertical' }), className)}
        {...restFlatListProps}
      >
        {headerContent}
        <HorizontalScrollArea
          key={scrollKey}
          isDesktop={isDesktop}
          emblaOptions={emblaOptions}
          mobileScrollSnapClassName={mobileScrollSnapClassName}
          loading={Boolean(loading)}
          {...rowContainerProps}
          className={cn(rowClassName, rowContainerProps?.className)}
        >
          {listBody}
        </HorizontalScrollArea>
        {footerContent}
        {infiniteOptions && (
          <FlatListInfinite
            {...infiniteOptions}
            renderSkeleton={renderSkeleton}
            renderDivider={renderDivider}
          />
        )}
      </div>
    )
  }

  const rowsList = loading
    ? Array.from({ length: columns }, () => [] as T[])
    : data?.length
      ? chunk(data, rowsCount)
      : []

  const multiRowBody = rowsList.map((items, index) => (
    <div
      key={index}
      className={cn('min-w-0 shrink-0', !isDesktop && mobileItemSnapClassName)}
    >
      <FlatList
        data={items}
        itemKey={itemKey}
        loading={loading}
        direction="vertical"
        renderItem={renderItem}
        skeletonCount={rowsCount}
        renderSkeleton={renderSkeleton}
        renderDivider={renderDivider}
        className={cn(columnContainerProps?.className, columnClassName)}
      />
    </div>
  ))

  if (fragment) {
    return (
      <Fragment>
        {headerContent}
        <HorizontalScrollArea
          key={scrollKey}
          isDesktop={isDesktop}
          emblaOptions={emblaOptions}
          mobileScrollSnapClassName={mobileScrollSnapClassName}
          loading={Boolean(loading)}
          {...rowContainerProps}
          className={cn(rowClassName, rowContainerProps?.className)}
        >
          {multiRowBody}
        </HorizontalScrollArea>
        {footerContent}
        {infiniteOptions && (
          <FlatListInfinite
            {...infiniteOptions}
            renderSkeleton={renderSkeleton}
            renderDivider={renderDivider}
          />
        )}
      </Fragment>
    )
  }

  return (
    <div
      ref={nodeRef}
      className={cn(flatListVariants({ direction: 'vertical' }), className)}
      {...restFlatListProps}
    >
      {headerContent}
      <HorizontalScrollArea
        key={scrollKey}
        isDesktop={isDesktop}
        emblaOptions={emblaOptions}
        mobileScrollSnapClassName={mobileScrollSnapClassName}
        loading={Boolean(loading)}
        {...rowContainerProps}
        className={cn(rowClassName, rowContainerProps?.className)}
      >
        {multiRowBody}
      </HorizontalScrollArea>
      {footerContent}
      {infiniteOptions && (
        <FlatListInfinite
          {...infiniteOptions}
          renderSkeleton={renderSkeleton}
          renderDivider={renderDivider}
        />
      )}
    </div>
  )
}

export const GridList = memo(GridListComponent) as typeof GridListComponent
