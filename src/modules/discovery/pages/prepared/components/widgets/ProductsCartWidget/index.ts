import ProductsCartWidgetComponent from './ProductsCartWidget'
import ProductsCartWidgetSkeletonComponent from './ProductsCartWidget.Skeleton'

const ProductsCartWidget = Object.assign(ProductsCartWidgetComponent, {
  Skeleton: ProductsCartWidgetSkeletonComponent,
})

export default ProductsCartWidget
