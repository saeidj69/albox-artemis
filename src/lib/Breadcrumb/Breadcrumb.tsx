import type { ElementType } from 'react'

import { RiArrowRightSLine, RiMoreLine } from '@remixicon/react'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

import type {
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbRootProps,
  BreadcrumbSeparatorProps,
} from './types'
import { breadcrumbVariants } from './variants'

const BreadcrumbRootComponent = (props: BreadcrumbRootProps) => {
  const { ref, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    />
  )
}

const BreadcrumbListComponent = (props: BreadcrumbListProps) => {
  const { ref, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={slots.list({ className: cn(className, classNames?.list) })}
      {...otherProps}
    />
  )
}

const BreadcrumbItemComponent = (props: BreadcrumbItemProps) => {
  const { ref, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <li
      ref={ref}
      data-slot="breadcrumb-item"
      className={slots.item({ className: cn(className, classNames?.item) })}
      {...otherProps}
    />
  )
}

const BreadcrumbLinkComponent = (props: BreadcrumbLinkProps) => {
  const { ref, asChild, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()
  const Comp = (asChild ? Slot.Root : 'a') as ElementType

  return (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={slots.link({ className: cn(className, classNames?.link) })}
      {...otherProps}
    />
  )
}

const BreadcrumbPageComponent = (props: BreadcrumbPageProps) => {
  const { ref, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={slots.page({ className: cn(className, classNames?.page) })}
      {...otherProps}
    />
  )
}

const BreadcrumbSeparatorComponent = (props: BreadcrumbSeparatorProps) => {
  const { ref, children, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <li
      ref={ref}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={slots.separator({
        className: cn(className, classNames?.separator),
      })}
      {...otherProps}
    >
      {children ?? <RiArrowRightSLine aria-hidden />}
    </li>
  )
}

const BreadcrumbEllipsisComponent = (props: BreadcrumbEllipsisProps) => {
  const { ref, className, classNames, ...otherProps } = props
  const slots = breadcrumbVariants()

  return (
    <span
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={slots.ellipsis({
        className: cn(className, classNames?.ellipsis),
      })}
      {...otherProps}
    >
      <RiMoreLine
        aria-hidden
        className={slots.ellipsisIcon({
          className: classNames?.ellipsisIcon,
        })}
      />
      <span
        data-slot="breadcrumb-ellipsis-label"
        className={slots.ellipsisLabel({
          className: classNames?.ellipsisLabel,
        })}
      >
        بیشتر
      </span>
    </span>
  )
}

export {
  BreadcrumbEllipsisComponent,
  BreadcrumbItemComponent,
  BreadcrumbLinkComponent,
  BreadcrumbListComponent,
  BreadcrumbPageComponent,
  BreadcrumbRootComponent,
  BreadcrumbSeparatorComponent,
}
