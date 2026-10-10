import { cn } from '@/lib/utils/cn'

import { addToBasketSkeletonVariants } from './add-to-basket.variants'
import type { AddToBasketSkeletonProps } from './types'

const AddToBasketButtonSkeletonComponent = (
  props: AddToBasketSkeletonProps,
) => {
  const { className, classNames, size = 'default' } = props

  const slots = addToBasketSkeletonVariants({ size })

  return (
    <div
      data-slot="add-to-basket-button-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    />
  )
}

export default AddToBasketButtonSkeletonComponent
