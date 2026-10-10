'use client'

import type { ComponentProps } from 'react'

import HorizontalProductList from '@/components/HorizontalProductList'

type ProductsCartWidgetSkeletonProps = ComponentProps<'section'>

const ProductsCartWidgetSkeleton = (props: ProductsCartWidgetSkeletonProps) => {
  return (
    <HorizontalProductList.Skeleton
      data-slot="prepared-products-cart-widget-skeleton"
      {...props}
    />
  )
}

export default ProductsCartWidgetSkeleton
