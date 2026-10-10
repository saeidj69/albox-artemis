import { Fragment, isValidElement, ReactElement, type ReactNode } from 'react'

import isFunction from 'lodash/isFunction'

import type {
  RenderDividerFunction,
  RenderItemFunction,
  RenderSkeletonFunction,
} from './types'

/**
 * Utility type to check if a value is a function
 */
type MaybeFunction<T, Args extends unknown[]> = T | ((...args: Args) => T)

/**
 * Resolves a render prop that can be either a ReactElement, a function, or any other value
 * This eliminates the duplication of isValidElement/isFunction checks throughout the component
 * @param prop - The render prop to resolve (can be ReactElement, function, or other value)
 * @param args - Arguments to pass to the function if prop is a function
 * @returns The resolved value
 */
export function resolveRenderProp<T extends ReactNode, A extends unknown[]>(
  prop: MaybeFunction<T, A>,
  ...args: A
): T {
  if (isValidElement(prop)) {
    return prop as T
  }

  if (isFunction(prop)) {
    return (prop as (...args: A) => T)(...args)
  }

  return prop as T
}

/**
 * Generates a unique key for a list item
 * Handles both function-based and property-based key generation
 * @param item - The current item
 * @param index - The index of the current item
 * @param totalLength - The total number of items
 * @param keyProp - Optional key extractor (property name or function)
 * @returns A unique string key for the item
 */
export function generateItemKey<T>(
  item: T,
  index: number,
  totalLength: number,
  keyProp?:
    | keyof T
    | ((item: T, index: number, length: number) => string | number),
): string {
  if (!keyProp) {
    return `item-${index}`
  }

  if (isFunction(keyProp)) {
    return String(keyProp(item, index, totalLength))
  }

  // Handle property-based key
  const keyValue = item[keyProp]

  return keyValue ? String(keyValue) : `item-${index}`
}

/**
 * Checks if divider should be rendered for current index
 * @param index - The current item index
 * @param totalLength - The total number of items
 * @param renderDivider - Optional divider render prop
 * @returns True if divider should be rendered
 */
export function shouldRenderDivider(
  index: number,
  totalLength: number,
  renderDivider?: unknown,
): boolean {
  return !!renderDivider && index < totalLength - 1
}

/**
 * Creates an array of specified length for skeleton rendering
 * @param count - The number of skeleton items to create
 * @returns An array of numbers from 0 to count-1
 */
export function createSkeletonArray(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index)
}

/**
 * Renders skeleton items when loading
 * @param renderSkeleton - Function or element to render for each skeleton
 * @param renderDivider - Optional function or element to render between skeletons
 * @param skeletonCount - Number of skeleton items to render
 * @returns Array of ReactElements representing skeleton items
 */
export function renderSkeletonItems(
  renderSkeleton: ReactElement | RenderSkeletonFunction,
  renderDivider: ReactElement | RenderDividerFunction | undefined,
  skeletonCount: number,
): ReactElement[] {
  return createSkeletonArray(skeletonCount).map((index) => {
    const skeletonKey = `skeleton-${index}`
    const skeleton = resolveRenderProp(renderSkeleton, index, skeletonCount)
    const showDivider = shouldRenderDivider(index, skeletonCount, renderDivider)

    return (
      <Fragment key={skeletonKey}>
        {skeleton}
        {showDivider &&
          renderDivider &&
          resolveRenderProp(renderDivider, index, skeletonCount)}
      </Fragment>
    )
  })
}

/**
 * Renders list items with optional dividers
 * @param items - Array of items to render
 * @param renderItem - Function or element to render for each item
 * @param renderDivider - Optional function or element to render between items
 * @param itemKey - Optional key extractor (property name or function)
 * @returns Array of ReactElements representing the list items
 */
export function renderListItems<T>(
  items: T[],
  renderItem: ReactElement | RenderItemFunction<T>,
  renderDivider: ReactElement | RenderDividerFunction | undefined,
  itemKey?:
    | keyof T
    | ((item: T, index: number, length: number) => string | number),
): ReactElement[] {
  return items.map((item, index) => {
    const key = generateItemKey(item, index, items.length, itemKey)
    const renderedItem = resolveRenderProp(
      renderItem,
      item,
      index,
      items.length,
    )
    const showDivider = shouldRenderDivider(index, items.length, renderDivider)

    return (
      <Fragment key={key}>
        {renderedItem}
        {showDivider &&
          renderDivider &&
          resolveRenderProp(renderDivider, index, items.length)}
      </Fragment>
    )
  })
}
