import type { HTMLAttributes } from 'react'

import type { EmblaOptionsType } from 'embla-carousel'

import type { FlatListProps } from '@/lib/FlatList'

export type GridListProps<T> = FlatListProps<T> & {
  rows: number
  columns: number
  rowClassName?: string
  columnClassName?: string
  rowContainerProps?: HTMLAttributes<HTMLDivElement>
  columnContainerProps?: HTMLAttributes<HTMLDivElement>
  /**
   * Embla options when viewport is desktop (≥ md). Controls snap (`align`, `skipSnaps`),
   * `dragFree`, and other carousel behavior.
   */
  emblaOptions?: EmblaOptionsType
  /**
   * Classes for the mobile horizontal scroller (e.g. `snap-x snap-mandatory`).
   */
  mobileScrollSnapClassName?: string
  /**
   * Classes applied to each slide on mobile only (e.g. `snap-start`).
   */
  mobileItemSnapClassName?: string
}
