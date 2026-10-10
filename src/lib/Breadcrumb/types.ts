import type { ComponentPropsWithRef } from 'react'

import type { BreadcrumbSkeletonSlots, BreadcrumbSlots } from './variants'

export type BreadcrumbRootProps = ComponentPropsWithRef<'nav'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbListProps = ComponentPropsWithRef<'ol'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbItemProps = ComponentPropsWithRef<'li'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbLinkProps = ComponentPropsWithRef<'a'> & {
  asChild?: boolean
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbPageProps = ComponentPropsWithRef<'span'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbSeparatorProps = ComponentPropsWithRef<'li'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export type BreadcrumbEllipsisProps = ComponentPropsWithRef<'span'> & {
  classNames?: Partial<Record<BreadcrumbSlots, string>>
}

export interface BreadcrumbSkeletonProps {
  className?: string
  classNames?: Partial<Record<BreadcrumbSkeletonSlots, string>>
  /** Number of segment placeholders (chevrons show between). @default 4 */
  segmentCount?: number
}
