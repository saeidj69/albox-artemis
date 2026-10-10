import AddToBasketButtonComponent from './AddToBasketButton'
import AddToBasketButtonSkeletonComponent from './AddToBasketButton.Skeleton'
import AddToBasketIconComponent from './AddToBasketIcon'

const AddToBasketButton = Object.assign(AddToBasketButtonComponent, {
  Skeleton: AddToBasketButtonSkeletonComponent,
})

const AddToBasketIcon = AddToBasketIconComponent

export type {
  AddToBasketButtonModeProps,
  AddToBasketButtonProps,
  AddToBasketCartState,
  AddToBasketIconProps,
  AddToBasketSkeletonProps,
} from './types'

export { AddToBasketButton, AddToBasketIcon }
