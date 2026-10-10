'use client'

import * as React from 'react'

import {
  create,
  hide,
  NiceModalContext,
  NiceModalHocProps,
  show,
  useModal as useSheet,
} from '@ebay/nice-modal-react'
import { ArrowDown2, CloseCircle } from 'iconsax-reactjs'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../Dialog'
import {
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
} from '../Drawer'
import IconButton from '../IconButton'
import { cn } from '../utils'

/* eslint-disable @typescript-eslint/no-explicit-any */

function Sheet({
  open,
  title,
  onClose,
  children,
  description,
  onOpenChange,
  onAnimationEnd,
  contentProps,
  ...props
}: React.ComponentProps<typeof Dialog & typeof Drawer> & {
  title: string
  description: string
  contentProps?: React.ComponentProps<
    typeof DialogContent & typeof DrawerContent
  >
}) {
  const sheet = useSheet()
  const isDesktop = false

  const Tag = isDesktop ? Dialog : Drawer

  const isOpen = open ?? sheet.visible

  return (
    <Tag
      {...props}
      data-slot="sheet"
      onClose={undefined}
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange?.(open)
        if (!open) {
          sheet.hide()
          onClose?.()
        }
      }}
      onAnimationEnd={(open) => {
        onAnimationEnd?.(open)
        if (!open) sheet.hide()
      }}
    >
      <SheetContent {...contentProps}>
        {title ? <SheetTitle>{title}</SheetTitle> : null}
        {description ? (
          <SheetDescription>{description}</SheetDescription>
        ) : null}
        {children}
      </SheetContent>
    </Tag>
  )
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DialogTrigger & typeof DrawerTrigger>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogTrigger : DrawerTrigger

  return <Tag data-slot="sheet-trigger" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof DialogPortal & typeof DrawerPortal>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogPortal : DrawerPortal

  return <Tag data-slot="sheet-portal" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogClose & typeof DrawerClose>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogClose : DrawerClose

  return <Tag data-slot="sheet-close" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogOverlay & typeof DrawerOverlay>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogOverlay : DrawerOverlay

  return <Tag data-slot="sheet-overlay" className={cn(className)} {...props} />
}

function SheetContent({
  ...props
}: React.ComponentProps<typeof DialogContent & typeof DrawerContent>) {
  const isDesktop = false

  return isDesktop ? <DialogContent {...props} /> : <DrawerContent {...props} />
}

type SheetHeaderProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  title?: React.ReactNode
  showClose?: boolean
  onClose?: () => void
}

function SheetHeader({
  title,
  className,
  onClose,
  showClose = false,
  ...props
}: SheetHeaderProps) {
  const sheet = useSheet()
  const isDesktop = false

  const Tag = isDesktop ? DialogHeader : DrawerHeader

  const closeIcon = isDesktop ? (
    <CloseCircle className="size-5" aria-hidden />
  ) : (
    <ArrowDown2 className="size-6" aria-hidden />
  )

  return (
    <Tag
      data-slot="sheet-header"
      className={cn('relative flex items-center justify-center p-4', className)}
      {...props}
    >
      {showClose ? (
        <IconButton
          type="button"
          variant="ghost"
          size="medium"
          className="absolute right-4 shrink-0"
          icon={closeIcon}
          aria-label="Close sheet"
          onClick={() => {
            onClose?.()
            void sheet.hide()
          }}
        />
      ) : null}
      <div className="typo-title-small text-text-primary min-h-6">{title}</div>
    </Tag>
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogFooter : DrawerFooter

  return <Tag data-slot="sheet-footer" className={cn(className)} {...props} />
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle & typeof DrawerTitle>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogTitle : DrawerTitle

  return (
    <Tag
      data-slot="sheet-title"
      className={cn('sr-only', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription & typeof DrawerDescription>) {
  const isDesktop = false

  const Tag = isDesktop ? DialogDescription : DrawerDescription

  return (
    <Tag
      data-slot="sheet-description"
      className={cn('sr-only', className)}
      {...props}
    />
  )
}

function showSheet<Component extends React.FunctionComponent<any>>(
  component: Component,
  props: Omit<
    React.ComponentProps<Component>,
    keyof NiceModalHocProps
  > = {} as any,
) {
  void show(component, props)
}

function createSheet<Component extends React.FunctionComponent<any>>(
  component: Component,
) {
  return create(React.memo(component)) as unknown as Component
}

function hideSheet(sheet: string | React.FunctionComponent<any>) {
  void hide(sheet)
}

function useSheetCounts() {
  const context = React.useContext(NiceModalContext)
  return React.useMemo(() => Object.values(context).length, [context])
}

export {
  createSheet,
  hideSheet,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  showSheet,
  useSheet,
  useSheetCounts,
}
