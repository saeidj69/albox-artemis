import type { ComponentPropsWithRef, Key, ReactNode } from 'react'

import type { ListingProductSummary } from '@/api/models'

import type {
  HorizontalProductListSkeletonSlots,
  HorizontalProductListSlots,
} from './variants'

export type HorizontalProductListProps = Omit<
  ComponentPropsWithRef<'section'>,
  'children' | 'title'
> & {
  title: ReactNode
  products: ListingProductSummary[]
  dataSlot?: string
  titleHref?: string
  isLoading?: boolean
  skeletonCount?: number
  showAddToCartPreview?: boolean
  classNames?: Partial<Record<HorizontalProductListSlots, string>>
  /** Painted behind the title row; header stays `relative` so this can fill it. */
  headerBackdrop?: ReactNode
  /**
   * Extra header content (e.g. a countdown), rendered in the leading cluster
   * alongside the "more" link.
   */
  headerAside?: ReactNode
  /** Replaces the default `مشاهده همه` label and chevron inside the more link. */
  moreLinkContent?: ReactNode
  /**
   * CSS length for the horizontal gap between cards (e.g. "16px"). Applied as
   * inline padding-left on each item; when omitted the default `pl-3` spacing
   * keeps applying.
   */
  itemGap?: string
  onProductFullyVisible?: (
    product: ListingProductSummary,
    index: number,
  ) => void
  onProductOpen?: (product: ListingProductSummary, index: number) => void
  onProductFirstAdd?: (product: ListingProductSummary, index: number) => void
  /** Rendered as `data-tracking-id` on each product's carousel item. */
  getProductTrackingId?: (
    product: ListingProductSummary,
    index: number,
  ) => string
  getProductKey?: (product: ListingProductSummary, index: number) => Key
}

export type HorizontalProductListSkeletonProps = Omit<
  ComponentPropsWithRef<'section'>,
  'children'
> & {
  skeletonCount?: number
  classNames?: Partial<Record<HorizontalProductListSkeletonSlots, string>>
}
