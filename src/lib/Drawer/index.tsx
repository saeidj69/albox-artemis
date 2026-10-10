'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

import {
  create,
  hide,
  NiceModalContext,
  NiceModalHocProps,
  show,
  useModal as useDrawerModal,
} from '@ebay/nice-modal-react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      repositionInputs={false}
      data-slot="drawer"
      {...props}
    />
  )
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/10',
        'data-open:animate-in data-open:fade-in-0',
        'data-closed:animate-out data-closed:fade-out-0',
        'supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'bg-background-main group/drawer-content fixed z-50 h-auto',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mx-auto data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:w-full data-[vaul-drawer-direction=bottom]:max-w-md data-[vaul-drawer-direction=bottom]:rounded-t-4xl',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mx-auto data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:w-full data-[vaul-drawer-direction=top]:max-w-md data-[vaul-drawer-direction=top]:rounded-b-xl',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-[max(0px,calc(50%-14rem))] data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:max-w-md data-[vaul-drawer-direction=left]:rounded-r-xl',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-[max(0px,calc(50%-14rem))] data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-md data-[vaul-drawer-direction=right]:rounded-l-xl',
          className,
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center',
        className,
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-foreground typo-title-small', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function showDrawer<Component extends React.FunctionComponent<any>>(
  component: Component,
  props: Omit<
    React.ComponentProps<Component>,
    keyof NiceModalHocProps
  > = {} as any,
) {
  void show(component, props)
}

function createDrawer<Component extends React.FunctionComponent<any>>(
  component: Component,
) {
  return create(React.memo(component)) as unknown as Component
}

function hideDrawer(drawer: string | React.FunctionComponent<any>) {
  void hide(drawer)
}

function useDrawerCounts() {
  const context = React.useContext(NiceModalContext)
  return React.useMemo(() => Object.values(context).length, [context])
}

export {
  createDrawer,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  hideDrawer,
  showDrawer,
  useDrawerModal as useDrawer,
  useDrawerCounts,
}
