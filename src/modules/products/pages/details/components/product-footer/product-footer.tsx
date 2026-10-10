import Animate from '@/components/Animate'
import Layout from '@/components/Layout'
import PriceTag from '@/components/PriceTag'

import { AddToBasketButton } from '@/modules/purchase/components/add-to-basket'

import type { ListingProduct } from '@/api/models'

type ProductFooterBarProps = {
  product: ListingProduct
}

const ProductFooterBar = (props: ProductFooterBarProps) => {
  const { product } = props

  const isAvailable = product.purchasableQuantity > 0

  if (!isAvailable) {
    return (
      <Layout.Footer height={84} className="bg-background-main shadow-sm">
        <Animate delay={200} animation="slideUp" className="p-4">
          <AddToBasketButton
            product={product}
            disabled={!isAvailable}
            source="PDP"
          />
        </Animate>
      </Layout.Footer>
    )
  }

  return (
    <Layout.Footer height={84} className="bg-background-main shadow-sm">
      <Animate delay={200} animation="slideUp" className="p-4">
        <div className="flex items-center justify-between gap-4">
          <PriceTag
            product={product}
            classNames={{ root: 'flex-1 text-right' }}
          />

          <div className="w-1/2">
            <AddToBasketButton
              product={product}
              disabled={!isAvailable}
              source="PDP"
            />
          </div>
        </div>
      </Animate>
    </Layout.Footer>
  )
}

export default ProductFooterBar
