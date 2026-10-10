import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'

/**
 * Function type for rendering individual list items
 * @param item - The current item being rendered
 * @param index - The index of the current item
 * @param length - The total number of items
 * @returns ReactElement to render
 */
export type RenderItemFunction<T> = (
  item: T,
  index: number,
  length: number,
) => ReactElement

/**
 * Function type for generating unique keys for list items
 * @param item - The current item
 * @param index - The index of the current item
 * @param length - The total number of items
 * @returns A unique string or number key
 */
export type RenderItemKey<T> = (
  item: T,
  index: number,
  length: number,
) => string | number

/**
 * Function type for rendering skeleton loading states
 * @param index - The index of the current skeleton
 * @param length - The total number of skeletons
 * @returns ReactElement to render
 */
export type RenderSkeletonFunction = (
  index: number,
  length: number,
) => ReactNode

/**
 * Function type for rendering dividers between items
 * @param index - The index of the item before the divider
 * @param length - The total number of items
 * @returns ReactElement to render
 */
export type RenderDividerFunction = (index: number, length: number) => ReactNode

/**
 * Base props for the FlatList component
 */
export type FlatListBaseProps<T> = {
  /**
   * Array of data to render
   */
  data?: T[]

  /**
   * If true, renders children without a container div
   * @default false
   */
  fragment?: boolean

  /**
   * Loading state - shows skeletons when true
   * @default false
   */
  loading?: boolean

  /**
   * Number of skeleton items to show during loading
   * @default 4
   */
  skeletonCount?: number

  /**
   * Optional item to render at the start of the list
   */
  headerContent?: ReactNode

  /**
   * Optional item to render at the end of the list
   */
  footerContent?: ReactNode

  /**
   * Content to show when items array is empty and not loading
   */
  emptyContent?: ReactNode

  /**
   * Layout direction of the list
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical'

  /**
   * Key extractor - can be a property name or function
   */
  itemKey?: keyof T | RenderItemKey<T>

  /**
   * Required: how to render each item
   * Can be a ReactElement or a function that receives (item, index, length)
   */
  renderItem: ReactElement | RenderItemFunction<T>

  /**
   * Optional: how to render skeleton loading state
   * Can be a ReactElement or a function that receives (index, length)
   */
  renderSkeleton?: ReactElement | RenderSkeletonFunction

  /**
   * Optional: how to render dividers between items
   * Can be a ReactElement or a function that receives (index, length)
   */
  renderDivider?: ReactElement | RenderDividerFunction

  /**
   * Infinite scroll feature
   */
  infiniteOptions?: {
    /**
     * Infinite scroll feature
     * Callback fired when the user scrolls near the end of the list
     */
    onLoadMore: () => void

    /**
     * Whether there are more items to load
     * @default false
     */
    hasMore?: boolean

    /**
     * Whether more items are currently being loaded
     * @default false
     */
    loadingMore?: boolean

    /**
     * Number of skeleton items to show when loading more
     * @default 2
     */
    loadingMoreSkeletonCount?: number

    /**
     * Threshold for intersection observer (0-1)
     * How much of the trigger element must be visible before onLoadMore fires
     * @default 0.7
     */
    threshold?: number

    /**
     * Root margin for intersection observer
     * Can be used to trigger loading earlier or later
     * @default "-40px"
     */
    rootMargin?: string
  }
}

/**
 * Props for the FlatListInfinite component
 */
export type FlatListInfiniteProps<T> = Required<
  FlatListBaseProps<T>
>['infiniteOptions'] &
  Pick<FlatListBaseProps<T>, 'renderSkeleton' | 'renderDivider'> & {
    /**
     * Ref to the container div element
     */
    nodeRef?: Ref<HTMLDivElement>
  }

/**
 * Full props for the FlatList component including HTML div attributes
 */
export type FlatListProps<T> = FlatListBaseProps<T> &
  Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Ref to the container div element
     */
    nodeRef?: Ref<HTMLDivElement>
  }
