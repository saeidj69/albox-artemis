import {
  BreadcrumbEllipsisComponent,
  BreadcrumbItemComponent,
  BreadcrumbLinkComponent,
  BreadcrumbListComponent,
  BreadcrumbPageComponent,
  BreadcrumbRootComponent,
  BreadcrumbSeparatorComponent,
} from './Breadcrumb'
import BreadcrumbSkeletonComponent from './Breadcrumb.Skeleton'

export type {
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbRootProps,
  BreadcrumbSeparatorProps,
  BreadcrumbSkeletonProps,
} from './types'
export type { BreadcrumbSkeletonSlots, BreadcrumbSlots } from './variants'

const Breadcrumb = Object.assign(BreadcrumbRootComponent, {
  List: BreadcrumbListComponent,
  Item: BreadcrumbItemComponent,
  Link: BreadcrumbLinkComponent,
  Page: BreadcrumbPageComponent,
  Separator: BreadcrumbSeparatorComponent,
  Ellipsis: BreadcrumbEllipsisComponent,
  Skeleton: BreadcrumbSkeletonComponent,
})

export default Breadcrumb
