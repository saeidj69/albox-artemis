import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import HeaderLogo from '@/components/Header/components/HeaderLogo'
import Layout from '@/components/Layout'

import ProductBreadcrumb from './product-breadcrumb'
import ProductFooterBar from './product-footer'
import ProductImageSectionSkeleton from './product-image-section/product-image-section.skeleton'
import ProductInfoHeader from './product-info-header'
import ProductPriceTable from './product-price-table'

const ProductDetailsPageSkeleton = () => {
  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="جزئیات محصول"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="flex flex-col gap-4 py-4">
        <ProductBreadcrumb.Skeleton />

        <ProductImageSectionSkeleton />

        <ProductInfoHeader.Skeleton />
        <ProductPriceTable.Skeleton />
      </main>

      <ProductFooterBar.Skeleton />
    </>
  )
}

export default ProductDetailsPageSkeleton
