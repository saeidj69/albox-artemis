import ProductPriceTableComponent from './product-price-table'
import ProductPriceTableSkeletonComponent from './product-price-table.skeleton'

const ProductPriceTable = Object.assign(ProductPriceTableComponent, {
  Skeleton: ProductPriceTableSkeletonComponent,
})

export default ProductPriceTable
