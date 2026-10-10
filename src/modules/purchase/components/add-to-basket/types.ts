import type React from 'react'

import type { VariantProps } from 'tailwind-variants'

import type { ListingProductSummary } from '@/api/models'

import type {
  addToBasketSkeletonVariants,
  addToBasketVariants,
  AddToBasketSkeletonSlots,
  AddToBasketSlots,
} from './add-to-basket.variants'

export type PressNavigateEvent = {
  currentTarget: Element
  preventDefault: () => void
  stopPropagation: () => void
}

export type AddToBasketCartState = {
  quantity: number
  atMax: boolean
  onIncrement: (event: PressNavigateEvent) => void
  onDecrement: (event: PressNavigateEvent) => void
  longPressHandlers: {
    onPointerDown: (event: React.PointerEvent) => void
    onPointerUp: (event: React.PointerEvent) => void
    onPointerLeave: (event: React.PointerEvent) => void
    onPointerCancel: (event: React.PointerEvent) => void
    onContextMenuCapture: (event: React.MouseEvent) => void
    onClick: (event: React.MouseEvent) => void
  }
  stopCardNavigation: (event: PressNavigateEvent) => void
}

export type AddToBasketButtonProps = {
  product: ListingProductSummary
  confirmRemove?: boolean
  disabled?: boolean
  source?: 'PC' | 'PDP' // Product Card | Product Detail Page
  onFirstAdd?: () => void
  classNames?: Partial<Record<AddToBasketSlots, string>>
} & VariantProps<typeof addToBasketVariants>

export type AddToBasketButtonModeProps = AddToBasketButtonProps &
  AddToBasketCartState

export type AddToBasketIconProps = {
  product: ListingProductSummary
  confirmRemove?: boolean
  disabled?: boolean
  source?: 'PC' | 'PDP'
  options?: {
    preview?: boolean
    onFirstAdd?: () => void
  }
  classNames?: Partial<Record<AddToBasketSlots, string>>
} & Pick<VariantProps<typeof addToBasketVariants>, 'size'>

export type AddToBasketSkeletonProps = {
  className?: string
  classNames?: Partial<Record<AddToBasketSkeletonSlots, string>>
} & VariantProps<typeof addToBasketSkeletonVariants>
